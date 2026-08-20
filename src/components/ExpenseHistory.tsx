import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Tag,
  ArrowUpDown,
  Download,
  X,
  FileSpreadsheet,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';
import { Expense, Category, PaymentMethod, CurrencyCode, ExpenseFilter } from '../types';
import { PAYMENT_METHODS } from '../constants/initialData';
import { formatCurrency } from '../utils/currency';
import { groupExpensesByDate, toLocalDateString } from '../utils/calculations';
import { exportExpensesToCSV, exportExpensesToPDF } from '../utils/export';
import { CategoryIcon } from './CategoryIcon';

interface ExpenseHistoryProps {
  expenses: Expense[];
  categories: Category[];
  currencyCode: CurrencyCode;
  selectedCategoryFilter: string | 'all';
  onSelectCategoryFilter: (categoryId: string | 'all') => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onOpenAddExpense: () => void;
}

export const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({
  expenses,
  categories,
  currencyCode,
  selectedCategoryFilter,
  onSelectCategoryFilter,
  onEditExpense,
  onDeleteExpense,
  onOpenAddExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [showFilterDrawer, setShowFilterDrawer] = useState<boolean>(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  // Filter and Sort Logic
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const todayStr = toLocalDateString(now);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = toLocalDateString(sevenDaysAgo);

    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = toLocalDateString(thirtyDaysAgo);

    return expenses.filter((exp) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cat = categories.find((c) => c.id === exp.categoryId);
        const catMatch = cat?.name.toLowerCase().includes(q);
        const noteMatch = exp.note?.toLowerCase().includes(q);
        const methodMatch = exp.paymentMethod.toLowerCase().includes(q);
        const amountMatch = String(exp.amount).includes(q);
        if (!catMatch && !noteMatch && !methodMatch && !amountMatch) {
          return false;
        }
      }

      // 2. Category Filter
      if (selectedCategoryFilter !== 'all' && exp.categoryId !== selectedCategoryFilter) {
        return false;
      }

      // 3. Payment Method Filter
      if (selectedPaymentMethod !== 'all' && exp.paymentMethod !== selectedPaymentMethod) {
        return false;
      }

      // 4. Date Range Filter
      if (dateFilter === 'today' && exp.date !== todayStr) return false;
      if (dateFilter === '7days' && exp.date < sevenDaysAgoStr) return false;
      if (dateFilter === '30days' && exp.date < thirtyDaysAgoStr) return false;
      if (dateFilter === 'custom') {
        if (customStartDate && exp.date < customStartDate) return false;
        if (customEndDate && exp.date > customEndDate) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') {
        const cmp = b.date.localeCompare(a.date);
        return cmp !== 0 ? cmp : (b.time || '').localeCompare(a.time || '');
      }
      if (sortBy === 'date-asc') {
        const cmp = a.date.localeCompare(b.date);
        return cmp !== 0 ? cmp : (a.time || '').localeCompare(b.time || '');
      }
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [
    expenses,
    categories,
    searchQuery,
    selectedCategoryFilter,
    selectedPaymentMethod,
    dateFilter,
    customStartDate,
    customEndDate,
    sortBy,
  ]);

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const groupedList = groupExpensesByDate(filteredExpenses);

  const activeFiltersCount =
    (selectedCategoryFilter !== 'all' ? 1 : 0) +
    (selectedPaymentMethod !== 'all' ? 1 : 0) +
    (dateFilter !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleClearAllFilters = () => {
    setSearchQuery('');
    onSelectCategoryFilter('all');
    setSelectedPaymentMethod('all');
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* 1. Search Bar & Filter Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search notes, categories, amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/70"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilterDrawer(!showFilterDrawer)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all relative ${
            activeFiltersCount > 0
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Filter size={15} />
          <span>Filter</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* 2. Filter & Sort Panel (Expandable) */}
      {showFilterDrawer && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Filter size={14} className="text-emerald-400" /> Filter & Sort Options
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Timeframe presets */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Date Period
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: '7days', label: 'Past 7 Days' },
                { id: '30days', label: 'Past 30 Days' },
                { id: 'custom', label: 'Custom Range' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setDateFilter(item.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    dateFilter === item.id
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {dateFilter === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">Start Date</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-1">End Date</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              <button
                onClick={() => onSelectCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  selectedCategoryFilter === 'all'
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategoryFilter(cat.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                    selectedCategoryFilter === cat.id
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Payment Method
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedPaymentMethod('all')}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                  selectedPaymentMethod === 'all'
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800'
                }`}
              >
                All Methods
              </button>
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => setSelectedPaymentMethod(pm.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                    selectedPaymentMethod === pm.id
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800'
                  }`}
                >
                  {pm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'date-desc', label: 'Newest First' },
                { id: 'date-asc', label: 'Oldest First' },
                { id: 'amount-desc', label: 'Highest Amount' },
                { id: 'amount-asc', label: 'Lowest Amount' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id as any)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                    sortBy === s.id
                      ? 'bg-slate-800 text-emerald-400 border-emerald-500/50'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Filter Summary & Quick Export Bar */}
      <div className="flex items-center justify-between px-2 py-2 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="text-[11px] text-slate-400 font-medium">
            Showing <span className="font-bold text-white">{filteredExpenses.length}</span> {filteredExpenses.length === 1 ? 'expense' : 'expenses'}
          </div>
          <div className="text-sm font-extrabold text-emerald-400 font-display">
            {formatCurrency(totalFilteredAmount, currencyCode)}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => exportExpensesToCSV(filteredExpenses, categories, currencyCode)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            title="Download CSV"
          >
            <FileSpreadsheet size={13} className="text-emerald-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={() => exportExpensesToPDF(filteredExpenses, categories, currencyCode)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            title="Download PDF"
          >
            <FileText size={13} className="text-rose-400" />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </div>

      {/* 4. Chronological Transaction Groups */}
      {groupedList.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/60 rounded-3xl border border-slate-800/80 p-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
            <Layers size={24} />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">No Matching Expenses</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto mb-4">
            Try adjusting your search query, clearing filters, or adding a new expense.
          </p>
          <button
            onClick={onOpenAddExpense}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20"
          >
            + Record Expense
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedList.map((dayGroup) => (
            <div key={dayGroup.rawDate} className="space-y-2">
              {/* Day Section Header */}
              <div className="flex items-center justify-between px-2 py-1 text-xs font-bold text-slate-400 sticky top-14 bg-slate-950/90 backdrop-blur-md z-10 rounded-lg">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Calendar size={13} className="text-emerald-400" />
                  {dayGroup.dateLabel}
                </span>
                <span className="font-display text-slate-300">
                  {formatCurrency(dayGroup.dayTotal, currencyCode)}
                </span>
              </div>

              {/* Day Expenses List */}
              <div className="space-y-2">
                {dayGroup.items.map((exp) => {
                  const cat = categories.find((c) => c.id === exp.categoryId) || {
                    name: 'Other',
                    icon: 'Package',
                    color: '#64748b',
                  };

                  return (
                    <div
                      key={exp.id}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800/90 transition-all hover:border-slate-700 shadow-sm"
                    >
                      <div
                        className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                        onClick={() => onEditExpense(exp)}
                      >
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} size={18} />
                        </div>
                        <div className="min-w-0 truncate pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate">
                              {cat.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-400 font-medium flex-shrink-0">
                              {exp.paymentMethod}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center gap-1">
                            {exp.note && <span className="text-slate-300">{exp.note} • </span>}
                            <span className="text-slate-500">{exp.time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Amount & Quick Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div
                          className="text-right cursor-pointer"
                          onClick={() => onEditExpense(exp)}
                        >
                          <span className="text-sm font-extrabold text-white font-display block">
                            {formatCurrency(exp.amount, currencyCode)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditExpense(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => setExpenseToDelete(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Delete this expense?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to remove{' '}
                <span className="font-bold text-white">
                  {formatCurrency(expenseToDelete.amount, currencyCode)}
                </span>{' '}
                for {categories.find((c) => c.id === expenseToDelete.categoryId)?.name || 'expense'}?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setExpenseToDelete(null)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteExpense(expenseToDelete.id);
                  setExpenseToDelete(null);
                }}
                className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-lg shadow-rose-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
