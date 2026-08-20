import React from 'react';
import { CategorySpending, CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { CategoryIcon } from '../CategoryIcon';

interface ComparisonBarChartProps {
  data: CategorySpending[];
  currencyCode?: CurrencyCode;
  maxItems?: number;
  onSelectCategory?: (categoryId: string) => void;
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  data,
  currencyCode = 'NGN',
  maxItems = 8,
  onSelectCategory,
}) => {
  const displayItems = data.slice(0, maxItems);
  const maxTotal = displayItems.length > 0 ? Math.max(...displayItems.map((d) => d.total)) : 1;

  if (displayItems.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-500">
        No category comparison data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayItems.map((item) => {
        const barWidth = Math.max((item.total / maxTotal) * 100, 4);

        return (
          <div
            key={item.categoryId}
            onClick={() => onSelectCategory && onSelectCategory(item.categoryId)}
            className="group cursor-pointer p-2.5 rounded-xl hover:bg-slate-850/60 transition-colors border border-transparent hover:border-slate-800"
          >
            <div className="flex items-center justify-between mb-1.5 text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: item.categoryColor }}
                >
                  <CategoryIcon name={item.categoryIcon} className="w-3.5 h-3.5" size={14} />
                </div>
                <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {item.categoryName}
                </span>
                <span className="text-[11px] text-slate-400">({item.count} {item.count === 1 ? 'txn' : 'txns'})</span>
              </div>
              <div className="flex items-center gap-2 text-right">
                <span className="font-bold text-slate-100 font-display">
                  {formatCurrency(item.total, currencyCode)}
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {item.percentage}%
                </span>
              </div>
            </div>

            {/* Progress Bar with Gradient */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: item.categoryColor,
                }}
              />
            </div>

            {/* Optional category budget threshold indicator */}
            {item.budget && (
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Monthly Budget: {formatCurrency(item.budget, currencyCode)}</span>
                <span className={item.percentOfBudget && item.percentOfBudget > 100 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
                  {item.percentOfBudget}% used
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
