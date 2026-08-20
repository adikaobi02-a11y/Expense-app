import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Calendar,
} from 'lucide-react';
import {
  Expense,
  Category,
  BudgetConfig,
  SpendingSummary,
  SmartInsight,
  CurrencyCode,
  TimeFrame,
} from '../types';
import { formatCurrency } from '../utils/currency';
import { getBreakdownForTimeframe, groupExpensesByDate } from '../utils/calculations';
import { DonutChart } from './Charts/DonutChart';
import { CategoryIcon } from './CategoryIcon';

interface DashboardProps {
  expenses: Expense[];
  categories: Category[];
  budget: BudgetConfig;
  summary: SpendingSummary;
  insights: SmartInsight[];
  currencyCode: CurrencyCode;
  onOpenAddExpense: () => void;
  onQuickAdd: (amount: number, categoryId: string, note: string) => void;
  onNavigateToExpenses: () => void;
  onNavigateToAnalytics: () => void;
  onSelectCategoryFilter: (categoryId: string) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  categories,
  budget,
  summary,
  insights,
  currencyCode,
  onOpenAddExpense,
  onQuickAdd,
  onNavigateToExpenses,
  onNavigateToAnalytics,
  onSelectCategoryFilter,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('today');

  // Compute breakdown according to active tab (today / week / month)
  const activeBreakdown = getBreakdownForTimeframe(expenses, categories, selectedTimeframe);

  // Group recent transactions
  const grouped = groupExpensesByDate(expenses.slice(0, 10));
  const recentDays = grouped.slice(0, 2);

  // Budget calculations for the active period
  const isToday = selectedTimeframe === 'today';
  const isWeek = selectedTimeframe === 'week';

  const activeSpend = isToday
    ? summary.totalToday
    : isWeek
    ? summary.totalWeek
    : summary.totalMonth;

  const activeBudget = isToday
    ? budget.daily
    : isWeek
    ? budget.weekly
    : budget.monthly;

  const activeRemaining = activeBudget - activeSpend;
  const activeUtilization = activeBudget > 0 ? (activeSpend / activeBudget) * 100 : 0;

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* 1. Timeframe Switcher Tabs */}
      <div className="flex items-center justify-between bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
        {(['today', 'week', 'month'] as TimeFrame[]).map((tf) => {
          const isActive = selectedTimeframe === tf;
          const labels: Record<string, string> = {
            today: "Today's Kudi",
            week: 'This Week',
            month: 'This Month',
          };
          return (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {labels[tf]}
            </button>
          );
        })}
      </div>

      {/* 2. Core Budget Hero Card (Requested format: Today's Spending, Daily Budget, Remaining) */}
      <div
        id="dashboard-hero-card"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 shadow-xl"
      >
        {/* Glow backdrop accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
            {isToday ? "Today's Spending" : isWeek ? 'Weekly Spending' : 'Monthly Spending'}
          </span>
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
              activeRemaining >= 0
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
            }`}
          >
            {activeRemaining >= 0 ? 'Within Budget' : 'Budget Exceeded'}
          </span>
        </div>

        {/* Main Big Number */}
        <div className="mb-4">
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            {formatCurrency(activeSpend, currencyCode)}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isToday
              ? `${summary.todayCount} ${summary.todayCount === 1 ? 'expense' : 'expenses'} recorded today`
              : `${activeBreakdown.breakdown.length} active spending categories`}
          </p>
        </div>

        {/* Budget vs Remaining Split Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {isToday ? 'Daily Budget' : isWeek ? 'Weekly Budget' : 'Monthly Budget'}
            </span>
            <span className="text-sm sm:text-base font-bold text-slate-200 font-display">
              {formatCurrency(activeBudget, currencyCode)}
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Remaining
            </span>
            <span
              className={`text-sm sm:text-base font-bold font-display ${
                activeRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(activeRemaining, currencyCode)}
            </span>
          </div>
        </div>

        {/* Utilization Bar */}
        <div className="mt-3.5 space-y-1">
          <div className="flex justify-between text-[11px] font-semibold">
            <span className="text-slate-400">Budget Utilization</span>
            <span
              className={
                activeUtilization > 90
                  ? 'text-rose-400 font-bold'
                  : activeUtilization > 70
                  ? 'text-yellow-400 font-bold'
                  : 'text-emerald-400 font-bold'
              }
            >
              {activeUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-850 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                activeUtilization > 90
                  ? 'bg-rose-500'
                  : activeUtilization > 70
                  ? 'bg-yellow-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(activeUtilization, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Nigerian Quick 1-Tap Expense Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={14} className="text-emerald-400" /> Quick 1-Tap Record
          </span>
          <span className="text-[10px] text-slate-500">Fast entry</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { amount: 500, catId: 'transport', label: 'Transport', note: 'Danfo / Keke fare', icon: 'Bus', color: '#0284c7' },
            { amount: 1500, catId: 'food', label: 'Lunch / Food', note: 'Mama Put / Lunch', icon: 'Utensils', color: '#f97316' },
            { amount: 1000, catId: 'data', label: 'Data Renewal', note: 'MTN/Airtel 1GB Data', icon: 'Wifi', color: '#10b981' },
            { amount: 500, catId: 'airtime', label: 'Airtime', note: 'Recharge card', icon: 'PhoneCall', color: '#06b6d4' },
          ].map((quick) => (
            <button
              key={quick.label}
              onClick={() => onQuickAdd(quick.amount, quick.catId, quick.note)}
              className="flex items-center gap-2 p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 transition-all text-left group active:scale-95"
            >
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: quick.color }}
              >
                <CategoryIcon name={quick.icon} size={14} />
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] font-bold text-white truncate">
                  +{formatCurrency(quick.amount, currencyCode)}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{quick.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Category Breakdown & Visual Donut Chart */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Spending Distribution
            </h3>
            <p className="text-[11px] text-slate-400">
              {isToday ? "Today's breakdown" : isWeek ? 'This week' : 'This month'} by category
            </p>
          </div>
          <button
            onClick={onNavigateToAnalytics}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            Analytics <ArrowRight size={13} />
          </button>
        </div>

        {/* Donut Chart Component */}
        <DonutChart
          data={activeBreakdown.breakdown}
          total={activeBreakdown.total}
          currencyCode={currencyCode}
          title={isToday ? "Today's Total" : isWeek ? 'Week Total' : 'Month Total'}
          onSelectCategory={(catId) => {
            onSelectCategoryFilter(catId);
            onNavigateToExpenses();
          }}
        />

        {/* Detailed Category List with Percentage & Amount (As requested in prompt) */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex justify-between px-1">
            <span>Category</span>
            <span>Amount & Share</span>
          </div>

          {activeBreakdown.breakdown.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500">
              No categories recorded for {selectedTimeframe} yet.
            </div>
          ) : (
            activeBreakdown.breakdown.map((item) => (
              <div
                key={item.categoryId}
                onClick={() => {
                  onSelectCategoryFilter(item.categoryId);
                  onNavigateToExpenses();
                }}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/70 border border-slate-850 cursor-pointer transition-all hover:border-slate-700"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: item.categoryColor }}
                  >
                    <CategoryIcon name={item.categoryIcon} size={16} />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-slate-200 block truncate">
                      {item.categoryName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
                    </span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-white block font-display">
                    {formatCurrency(item.total, currencyCode)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. Smart Nigerian Insights Banner */}
      {insights.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" /> Smart Observations
            </span>
          </div>

          <div className="space-y-2">
            {insights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                  insight.type === 'warning'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                    : insight.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : insight.type === 'tip'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <div className="p-1.5 rounded-xl bg-slate-950/60 flex-shrink-0 mt-0.5">
                  <CategoryIcon name={insight.iconName || 'Info'} size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{insight.title}</h4>
                  <p className="text-xs opacity-90 leading-relaxed">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Recent Transactions Preview */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Recent Transactions
            </h3>
            <p className="text-[11px] text-slate-400">Latest recorded expenses</p>
          </div>
          <button
            onClick={onNavigateToExpenses}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            View All ({expenses.length}) <ChevronRight size={14} />
          </button>
        </div>

        {recentDays.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500">
            No expenses recorded yet. Tap + to add one!
          </div>
        ) : (
          <div className="space-y-4">
            {recentDays.map((dayGroup) => (
              <div key={dayGroup.rawDate} className="space-y-2">
                <div className="flex justify-between items-center px-1 text-[11px] font-bold text-slate-400">
                  <span>{dayGroup.dateLabel}</span>
                  <span>{formatCurrency(dayGroup.dayTotal, currencyCode)}</span>
                </div>

                <div className="space-y-1.5">
                  {dayGroup.items.slice(0, 4).map((exp) => {
                    const cat = categories.find((c) => c.id === exp.categoryId) || {
                      name: 'Other',
                      icon: 'Package',
                      color: '#64748b',
                    };

                    return (
                      <div
                        key={exp.id}
                        onClick={() => onEditExpense(exp)}
                        className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-850/80 cursor-pointer transition-all hover:border-slate-700"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                            style={{ backgroundColor: cat.color }}
                          >
                            <CategoryIcon name={cat.icon} size={16} />
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-slate-200 block truncate">
                              {cat.name}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate block">
                              {exp.note || exp.paymentMethod} • {exp.time}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-bold text-white font-display">
                            {formatCurrency(exp.amount, currencyCode)}
                          </span>
                          <span className="text-[9px] text-slate-400 block">
                            {exp.paymentMethod}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
