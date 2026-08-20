import React, { useState } from 'react';
import {
  PieChart,
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  Award,
  Wallet,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { Expense, Category, BudgetConfig, SpendingSummary, CurrencyCode, TimeFrame } from '../types';
import { formatCurrency } from '../utils/currency';
import { getBreakdownForTimeframe, toLocalDateString } from '../utils/calculations';
import { DonutChart } from './Charts/DonutChart';
import { TrendLineChart } from './Charts/TrendLineChart';
import { ComparisonBarChart } from './Charts/ComparisonBarChart';
import { CategoryIcon } from './CategoryIcon';

interface AnalyticsProps {
  expenses: Expense[];
  categories: Category[];
  budget: BudgetConfig;
  summary: SpendingSummary;
  currencyCode: CurrencyCode;
  onSelectCategoryFilter: (categoryId: string) => void;
  onNavigateToExpenses: () => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({
  expenses,
  categories,
  budget,
  summary,
  currencyCode,
  onSelectCategoryFilter,
  onNavigateToExpenses,
}) => {
  const [activeTimeframe, setActiveTimeframe] = useState<TimeFrame>('month');

  // Breakdown for active timeframe
  const activeBreakdown = getBreakdownForTimeframe(expenses, categories, activeTimeframe);

  // Prepare trend data points
  const now = new Date();
  const trendPoints = [];
  const daysCount = activeTimeframe === 'today' ? 1 : activeTimeframe === 'week' ? 7 : 30;

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = toLocalDateString(d);
    const dayExpenses = expenses.filter((e) => e.date === dateStr);
    const daySum = dayExpenses.reduce((acc, curr) => acc + curr.amount, 0);

    const label =
      daysCount === 1
        ? 'Today'
        : daysCount <= 7
        ? d.toLocaleDateString('en-GB', { weekday: 'short' })
        : `${d.getDate()} ${d.toLocaleDateString('en-GB', { month: 'short' })}`;

    trendPoints.push({
      label,
      value: daySum,
      dateStr,
    });
  }

  // Payment method statistics
  const paymentMethodStats: Record<string, { total: number; count: number }> = {};
  expenses.forEach((e) => {
    const current = paymentMethodStats[e.paymentMethod] || { total: 0, count: 0 };
    paymentMethodStats[e.paymentMethod] = {
      total: current.total + e.amount,
      count: current.count + 1,
    };
  });

  const paymentStatsList = Object.entries(paymentMethodStats)
    .map(([method, data]) => ({
      method,
      total: data.total,
      count: data.count,
      percentage: summary.totalAllTime > 0 ? (data.total / summary.totalAllTime) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Highest spending category in active timeframe
  const topCategory = activeBreakdown.breakdown[0];

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* 1. Timeframe Navigation */}
      <div className="flex items-center justify-between bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
        {[
          { id: 'today' as TimeFrame, label: 'Today' },
          { id: 'week' as TimeFrame, label: '7 Days' },
          { id: 'month' as TimeFrame, label: '30 Days' },
          { id: 'year' as TimeFrame, label: 'This Year' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTimeframe(item.id)}
            className={`flex-1 py-2 px-1 text-xs font-bold rounded-xl transition-all ${
              activeTimeframe === item.id
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* 2. Key Metrics 4-Grid Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Spending */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Spent</span>
            <Wallet size={14} className="text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-white font-display">
            {formatCurrency(activeBreakdown.total, currencyCode)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Across {activeBreakdown.breakdown.length} categories
          </span>
        </div>

        {/* Average Daily Spend */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Daily Average</span>
            <TrendingUp size={14} className="text-sky-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-white font-display">
            {formatCurrency(
              activeBreakdown.total / (daysCount || 1),
              currencyCode,
              { compact: true }
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Per day in this period
          </span>
        </div>

        {/* Highest Category */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Top Category</span>
            <Award size={14} className="text-amber-400" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-white truncate">
            {topCategory ? topCategory.categoryName : 'None'}
          </div>
          <span className="text-[10px] text-emerald-400 font-bold mt-1 block">
            {topCategory ? `${topCategory.percentage}% of spending` : 'No data'}
          </span>
        </div>

        {/* Budget Health */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Budget</span>
            <Sparkles size={14} className="text-purple-400" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-white font-display">
            {summary.monthlyBudgetUtilization}%
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {formatCurrency(summary.remainingMonthlyBudget, currencyCode, { compact: true })} left
          </span>
        </div>
      </div>

      {/* 3. Daily Spending Trend (Line Chart) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <TrendingUp size={16} className="text-emerald-400" /> Spending Trend
            </h3>
            <p className="text-[11px] text-slate-400">Daily expenses progression</p>
          </div>
        </div>
        <div className="pt-2">
          <TrendLineChart data={trendPoints} currencyCode={currencyCode} height={170} />
        </div>
      </div>

      {/* 4. Category Spending Distribution (Donut Chart) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <PieChart size={16} className="text-emerald-400" /> Category Breakdown
          </h3>
          <p className="text-[11px] text-slate-400">Proportional spending distribution</p>
        </div>

        <DonutChart
          data={activeBreakdown.breakdown}
          total={activeBreakdown.total}
          currencyCode={currencyCode}
          title="Period Total"
          onSelectCategory={(catId) => {
            onSelectCategoryFilter(catId);
            onNavigateToExpenses();
          }}
        />
      </div>

      {/* 5. Category Comparison Ranking (Bar Chart) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <BarChart2 size={16} className="text-emerald-400" /> Category Comparison
            </h3>
            <p className="text-[11px] text-slate-400">Ranked by highest amount spent</p>
          </div>
        </div>

        <ComparisonBarChart
          data={activeBreakdown.breakdown}
          currencyCode={currencyCode}
          onSelectCategory={(catId) => {
            onSelectCategoryFilter(catId);
            onNavigateToExpenses();
          }}
        />
      </div>

      {/* 6. Payment Method Channel Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
            <Layers size={16} className="text-emerald-400" /> Payment Methods
          </h3>
          <p className="text-[11px] text-slate-400">How you paid for your transactions</p>
        </div>

        <div className="space-y-2 pt-1">
          {paymentStatsList.map((item) => (
            <div
              key={item.method}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80"
            >
              <div>
                <span className="text-xs font-bold text-slate-200 block">{item.method}</span>
                <span className="text-[10px] text-slate-400">
                  {item.count} {item.count === 1 ? 'transaction' : 'transactions'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-white font-display block">
                  {formatCurrency(item.total, currencyCode)}
                </span>
                <span className="text-[10px] font-bold text-emerald-400">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
