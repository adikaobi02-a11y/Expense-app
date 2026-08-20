import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  loadStoredData,
  saveExpenses,
  saveCategories,
  saveBudget,
  saveSettings,
  resetAllDataToDefault,
} from './utils/storage';
import {
  Expense,
  Category,
  BudgetConfig,
  AppSettings,
  PaymentMethod,
  CurrencyCode,
} from './types';
import { calculateSpendingSummary, generateSmartInsights } from './utils/calculations';
import { fetchLiveExchangeRates } from './utils/currency';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { ExpenseHistory } from './components/ExpenseHistory';
import { Analytics } from './components/Analytics';
import { SettingsView } from './components/SettingsView';
import { AddExpenseModal } from './components/AddExpenseModal';
import { CategoryManager } from './components/CategoryManager';
import { BudgetsView } from './components/BudgetsView';
import { PinLockModal } from './components/PinLockModal';

export default function App() {
  // 1. Initial State Loading
  const [data, setData] = useState(() => loadStoredData());
  const [expenses, setExpenses] = useState<Expense[]>(data.expenses);
  const [categories, setCategories] = useState<Category[]>(data.categories);
  const [budget, setBudget] = useState<BudgetConfig>(data.budget);
  const [settings, setSettings] = useState<AppSettings>(data.settings);

  // 2. Navigation & View State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState<boolean>(false);
  const [isBudgetsViewOpen, setIsBudgetsViewOpen] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | 'all'>('all');

  // 3. Security Lock State
  const [isLocked, setIsLocked] = useState<boolean>(Boolean(data.settings?.isPinEnabled && data.settings?.pinCode));
  const [isUpdatingRates, setIsUpdatingRates] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Auto-sync storage whenever state changes
  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    saveBudget(budget);
  }, [budget]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // 4. Spending Calculations & Recalculation Engine
  const summary = useMemo(() => {
    return calculateSpendingSummary(expenses, categories, budget, settings.currency);
  }, [expenses, categories, budget, settings.currency]);

  const insights = useMemo(() => {
    return generateSmartInsights(expenses, categories, summary, budget, settings.currency);
  }, [expenses, categories, summary, budget, settings.currency]);

  // 5. Expense CRUD Handlers
  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>,
    idToEdit?: string
  ) => {
    const now = Date.now();

    if (idToEdit) {
      // Edit existing
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === idToEdit
            ? { ...item, ...expenseData, updatedAt: now }
            : item
        )
      );
      showToast('Expense updated successfully!');
    } else {
      // Add new
      const newExpense: Expense = {
        ...expenseData,
        id: `exp_${now}_${Math.random().toString(36).substr(2, 4)}`,
        createdAt: now,
        updatedAt: now,
      };

      setExpenses((prev) => [newExpense, ...prev]);
      showToast('Expense recorded!');

      // Light confetti celebration if keeping well within daily budget
      if (summary.remainingDailyBudget - newExpense.amount > 0) {
        try {
          confetti({
            particleCount: 35,
            spread: 50,
            origin: { y: 0.8 },
            colors: ['#10b981', '#06b6d4', '#eab308'],
          });
        } catch (e) {
          // ignore if canvas-confetti fails
        }
      }
    }

    setExpenseToEdit(null);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Expense deleted', 'info');
  };

  const handleQuickAdd = (amount: number, categoryId: string, note: string) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    handleSaveExpense({
      amount,
      currency: settings.currency,
      categoryId,
      date: dateStr,
      time: `${hours}:${mins}`,
      note,
      paymentMethod: 'Cash',
    });
  };

  // 6. Settings & Data Handlers
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleRestoreData = (backup: {
    expenses: Expense[];
    categories: Category[];
    budget: BudgetConfig;
    settings: AppSettings;
  }) => {
    setExpenses(backup.expenses);
    setCategories(backup.categories);
    setBudget(backup.budget);
    setSettings(backup.settings);
    showToast('All backup data restored successfully!');
  };

  const handleResetAllData = () => {
    const reset = resetAllDataToDefault();
    setExpenses(reset.expenses);
    setCategories(reset.categories);
    setBudget(reset.budget);
    setSettings(reset.settings);
    setSelectedCategoryFilter('all');
    setActiveTab('home');
    showToast('App reset to fresh defaults', 'info');
  };

  const handleRefreshExchangeRates = async () => {
    setIsUpdatingRates(true);
    const result = await fetchLiveExchangeRates();
    setIsUpdatingRates(false);
    if (result) {
      handleUpdateSettings({ lastRateUpdate: result.updated });
      showToast(`Exchange rates updated (${result.updated})`);
    } else {
      showToast('Offline fallback rates active', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Mobile Android Container Wrapper */}
      <div className="w-full max-w-lg min-h-screen bg-slate-950 flex flex-col relative shadow-2xl border-x border-slate-900">
        {/* Security PIN Lock View */}
        {isLocked && settings.pinCode ? (
          <PinLockModal
            correctPin={settings.pinCode}
            onUnlocked={() => setIsLocked(false)}
          />
        ) : (
          <>
            {/* Top Header */}
            <Header
              currencyCode={settings.currency}
              onOpenCurrencyPicker={() => setActiveTab('settings')}
              monthlyRemaining={summary.remainingMonthlyBudget}
              onRefreshRates={handleRefreshExchangeRates}
              isUpdatingRates={isUpdatingRates}
            />

            {/* Global Toast Notification */}
            {toastMessage && (
              <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-slate-900/95 border border-emerald-500/40 text-xs font-bold text-emerald-300 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
                {toastMessage.text}
              </div>
            )}

            {/* Main Tab Views */}
            <main className="flex-1 px-4 py-4 overflow-y-auto">
              {activeTab === 'home' && (
                <Dashboard
                  expenses={expenses}
                  categories={categories}
                  budget={budget}
                  summary={summary}
                  insights={insights}
                  currencyCode={settings.currency}
                  onOpenAddExpense={() => {
                    setExpenseToEdit(null);
                    setIsAddExpenseOpen(true);
                  }}
                  onQuickAdd={handleQuickAdd}
                  onNavigateToExpenses={() => setActiveTab('expenses')}
                  onNavigateToAnalytics={() => setActiveTab('analytics')}
                  onSelectCategoryFilter={(catId) => setSelectedCategoryFilter(catId)}
                  onEditExpense={(exp) => {
                    setExpenseToEdit(exp);
                    setIsAddExpenseOpen(true);
                  }}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}

              {activeTab === 'expenses' && (
                <ExpenseHistory
                  expenses={expenses}
                  categories={categories}
                  currencyCode={settings.currency}
                  selectedCategoryFilter={selectedCategoryFilter}
                  onSelectCategoryFilter={setSelectedCategoryFilter}
                  onEditExpense={(exp) => {
                    setExpenseToEdit(exp);
                    setIsAddExpenseOpen(true);
                  }}
                  onDeleteExpense={handleDeleteExpense}
                  onOpenAddExpense={() => {
                    setExpenseToEdit(null);
                    setIsAddExpenseOpen(true);
                  }}
                />
              )}

              {activeTab === 'analytics' && (
                <Analytics
                  expenses={expenses}
                  categories={categories}
                  budget={budget}
                  summary={summary}
                  currencyCode={settings.currency}
                  onSelectCategoryFilter={(catId) => setSelectedCategoryFilter(catId)}
                  onNavigateToExpenses={() => setActiveTab('expenses')}
                />
              )}

              {activeTab === 'settings' && (
                <div>
                  {isBudgetsViewOpen ? (
                    <div className="space-y-4">
                      <button
                        onClick={() => setIsBudgetsViewOpen(false)}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mb-2"
                      >
                        ← Back to Settings
                      </button>
                      <BudgetsView
                        budget={budget}
                        onSaveBudget={setBudget}
                        summary={summary}
                        categories={categories}
                        currencyCode={settings.currency}
                        onClose={() => setIsBudgetsViewOpen(false)}
                      />
                    </div>
                  ) : (
                    <SettingsView
                      settings={settings}
                      onUpdateSettings={handleUpdateSettings}
                      expenses={expenses}
                      categories={categories}
                      budget={budget}
                      onRestoreData={handleRestoreData}
                      onResetAllData={handleResetAllData}
                      onOpenCategoryManager={() => setIsCategoryManagerOpen(true)}
                      onOpenBudgetsView={() => setIsBudgetsViewOpen(true)}
                    />
                  )}
                </div>
              )}
            </main>

            {/* Bottom Navigation */}
            <Navigation
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              onOpenAddExpense={() => {
                setExpenseToEdit(null);
                setIsAddExpenseOpen(true);
              }}
              todayExpenseCount={summary.todayCount}
            />

            {/* Add / Edit Expense Modal */}
            <AddExpenseModal
              isOpen={isAddExpenseOpen}
              onClose={() => {
                setIsAddExpenseOpen(false);
                setExpenseToEdit(null);
              }}
              onSaveExpense={handleSaveExpense}
              categories={categories}
              currencyCode={settings.currency}
              expenseToEdit={expenseToEdit}
              onOpenCategoryManager={() => {
                setIsAddExpenseOpen(false);
                setIsCategoryManagerOpen(true);
              }}
            />

            {/* Category Manager Modal */}
            <CategoryManager
              isOpen={isCategoryManagerOpen}
              onClose={() => setIsCategoryManagerOpen(false)}
              categories={categories}
              onSaveCategories={setCategories}
            />
          </>
        )}
      </div>
    </div>
  );
}
