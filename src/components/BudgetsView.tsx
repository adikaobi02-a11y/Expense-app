import React, { useState } from 'react';
import { Target, Check, AlertTriangle, ShieldCheck, TrendingUp, Sparkles, Plus, Wallet } from 'lucide-react';
import { BudgetConfig, SpendingSummary, Category, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/currency';
import { CategoryIcon } from './CategoryIcon';

interface BudgetsViewProps {
  budget: BudgetConfig;
  onSaveBudget: (budget: BudgetConfig) => void;
  summary: SpendingSummary;
  categories: Category[];
  currencyCode: CurrencyCode;
  onClose?: () => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budget,
  onSaveBudget,
  summary,
  categories,
  currencyCode,
  onClose,
}) => {
  const [daily, setDaily] = useState<string>(String(budget.daily || 10000));
  const [weekly, setWeekly] = useState<string>(String(budget.weekly || 60000));
  const [monthly, setMonthly] = useState<string>(String(budget.monthly || 220000));
  const [incomeMonthly, setIncomeMonthly] = useState<string>(String(budget.incomeMonthly || 300000));
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, number>>(budget.categoryBudgets || {});
  const [savedToast, setSavedToast] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveBudget({
      daily: parseFloat(daily) || 0,
      weekly: parseFloat(weekly) || 0,
      monthly: parseFloat(monthly) || 0,
      incomeMonthly: parseFloat(incomeMonthly) || 0,
      categoryBudgets,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
    if (onClose) setTimeout(onClose, 800);
  };

  const handleUpdateCategoryBudget = (catId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setCategoryBudgets((prev) => ({
      ...prev,
      [catId]: num,
    }));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Target size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Nigerian Budget Planner
            </h2>
            <p className="text-xs text-slate-400">
              Set spending limits for Daily, Weekly, and Monthly targets
            </p>
          </div>
        </div>

        {/* Live Budget Utilization Overview */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800">
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 text-center">
            <span className="text-[10px] text-slate-400 block">Today's Remaining</span>
            <span
              className={`text-xs sm:text-sm font-bold font-display ${
                summary.remainingDailyBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(summary.remainingDailyBudget, currencyCode)}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 text-center">
            <span className="text-[10px] text-slate-400 block">Weekly Remaining</span>
            <span
              className={`text-xs sm:text-sm font-bold font-display ${
                summary.remainingWeeklyBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(summary.remainingWeeklyBudget, currencyCode)}
            </span>
          </div>

          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-850 text-center">
            <span className="text-[10px] text-slate-400 block">Monthly Remaining</span>
            <span
              className={`text-xs sm:text-sm font-bold font-display ${
                summary.remainingMonthlyBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(summary.remainingMonthlyBudget, currencyCode)}
            </span>
          </div>
        </div>
      </div>

      {savedToast && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in">
          <Check size={16} /> Budget limits saved successfully!
        </div>
      )}

      {/* Main Budget Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Core Periods */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
          <span className="text-xs font-bold text-white uppercase tracking-wider block">
            Overall Limits ({currencyCode})
          </span>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Daily Budget Limit
              </label>
              <input
                type="number"
                value={daily}
                onChange={(e) => setDaily(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Weekly Budget Limit
              </label>
              <input
                type="number"
                value={weekly}
                onChange={(e) => setWeekly(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Monthly Budget Limit
              </label>
              <input
                type="number"
                value={monthly}
                onChange={(e) => setMonthly(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Monthly Income / Salary (Optional)
              </label>
              <input
                type="number"
                value={incomeMonthly}
                onChange={(e) => setIncomeMonthly(e.target.value)}
                placeholder="e.g. 250,000"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Helps calculate your savings margin automatically
              </span>
            </div>
          </div>
        </div>

        {/* Category Specific Monthly Budgets */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Category Monthly Caps
            </span>
            <span className="text-[10px] text-slate-400">Set target per category</span>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {categories.slice(0, 8).map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/60 border border-slate-850 gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={14} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {cat.name}
                  </span>
                </div>

                <div className="w-28 flex-shrink-0">
                  <input
                    type="number"
                    placeholder="₦0"
                    value={categoryBudgets[cat.id] || ''}
                    onChange={(e) => handleUpdateCategoryBudget(cat.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white text-right focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
        >
          <Check size={18} /> Save Budget Settings
        </button>
      </form>
    </div>
  );
};
