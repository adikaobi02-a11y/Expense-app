import React, { useState } from 'react';
import { CategorySpending, CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { CategoryIcon } from '../CategoryIcon';

interface DonutChartProps {
  data: CategorySpending[];
  total: number;
  currencyCode?: CurrencyCode;
  title?: string;
  onSelectCategory?: (categoryId: string) => void;
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  total,
  currencyCode = 'NGN',
  title = 'Total Spent',
  onSelectCategory,
  size = 240,
}) => {
  const [hoveredCat, setHoveredCat] = useState<CategorySpending | null>(null);

  if (!data || data.length === 0 || total === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800/80">
        <div className="w-24 h-24 rounded-full border-4 border-dashed border-slate-800 flex items-center justify-center mb-3">
          <span className="text-xs font-semibold text-slate-500">No Data</span>
        </div>
        <p className="text-sm text-slate-400 font-medium">No expenses recorded for this period</p>
        <p className="text-xs text-slate-500 mt-1">Tap + to add your first expense</p>
      </div>
    );
  }

  const radius = 80;
  const strokeWidth = 26;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col items-center">
      {/* Donut Graphic */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg height={size} width={size} viewBox="0 0 200 200" className="transform -rotate-90">
          <circle
            stroke="#1e293b"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx="100"
            cy="100"
          />
          {data.map((item) => {
            const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
            const rotation = (accumulatedPercent / 100) * 360;
            accumulatedPercent += item.percentage;

            const isHovered = hoveredCat?.categoryId === item.categoryId;

            return (
              <circle
                key={item.categoryId}
                stroke={item.categoryColor}
                fill="transparent"
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                style={{
                  strokeDashoffset,
                  transformOrigin: '50% 50%',
                  transform: `rotate(${rotation}deg)`,
                  transition: 'all 0.3s ease-out',
                  cursor: 'pointer',
                }}
                r={normalizedRadius}
                cx="100"
                cy="100"
                strokeLinecap="butt"
                onMouseEnter={() => setHoveredCat(item)}
                onMouseLeave={() => setHoveredCat(null)}
                onClick={() => onSelectCategory && onSelectCategory(item.categoryId)}
              />
            );
          })}
        </svg>

        {/* Center Text Information */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          {hoveredCat ? (
            <div className="animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <CategoryIcon name={hoveredCat.categoryIcon} className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-300 truncate max-w-[90px]">
                  {hoveredCat.categoryName}
                </span>
              </div>
              <div className="text-base font-extrabold text-white tracking-tight font-display">
                {formatCurrency(hoveredCat.total, currencyCode)}
              </div>
              <div className="text-xs font-bold text-emerald-400">
                {hoveredCat.percentage}%
              </div>
            </div>
          ) : (
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                {title}
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-white tracking-tight font-display">
                {formatCurrency(total, currencyCode, { compact: total >= 1000000 })}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {data.length} {data.length === 1 ? 'category' : 'categories'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Visual Chips under chart */}
      <div className="w-full mt-4 flex flex-wrap gap-2 justify-center">
        {data.slice(0, 4).map((item) => (
          <button
            key={item.categoryId}
            onClick={() => onSelectCategory && onSelectCategory(item.categoryId)}
            onMouseEnter={() => setHoveredCat(item)}
            onMouseLeave={() => setHoveredCat(null)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300 hover:bg-slate-750 transition-colors"
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.categoryColor }}
            />
            <span className="truncate max-w-[80px]">{item.categoryName}</span>
            <span className="font-bold text-emerald-400">{item.percentage}%</span>
          </button>
        ))}
      </div>
    </div>
  );
};
