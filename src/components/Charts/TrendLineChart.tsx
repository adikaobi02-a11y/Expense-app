import React, { useState } from 'react';
import { CurrencyCode } from '../../types';
import { formatCurrency } from '../../utils/currency';

interface DataPoint {
  label: string;
  value: number;
  dateStr: string;
}

interface TrendLineChartProps {
  data: DataPoint[];
  currencyCode?: CurrencyCode;
  height?: number;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({
  data,
  currencyCode = 'NGN',
  height = 180,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-slate-500">
        No spending trend data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1000);
  const paddingX = 30;
  const paddingY = 25;
  const width = 400;

  // Calculate points
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1 || 1)) * (width - paddingX * 2);
    const y = height - paddingY - (d.value / maxValue) * (height - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, index) => {
    if (index === 0) return `M ${curr.x} ${curr.y}`;
    // Simple smooth curve control points
    const prev = points[index - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="relative w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible select-none"
      >
        <defs>
          <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((pct) => {
          const y = height - paddingY - pct * (height - paddingY * 2);
          return (
            <g key={pct}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#334155"
                strokeDasharray="3 3"
                strokeWidth="1"
                opacity="0.4"
              />
              <text
                x={paddingX - 4}
                y={y + 3}
                fill="#64748b"
                fontSize="9"
                textAnchor="end"
                className="font-mono"
              >
                {formatCurrency(maxValue * pct, currencyCode, { compact: true })}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#spendGradient)" />

        {/* Line stroke */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineStroke)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.dateStr === p.dateStr ? 6 : 4}
              fill="#10b981"
              stroke="#0f172a"
              strokeWidth="2"
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
            {/* X Axis Labels (every 2 or 3 points) */}
            {(points.length <= 7 || i % Math.ceil(points.length / 5) === 0 || i === points.length - 1) && (
              <text
                x={p.x}
                y={height - 8}
                fill="#94a3b8"
                fontSize="9.5"
                textAnchor="middle"
                fontWeight="500"
              >
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>

      {/* Floating Tooltip */}
      {hoveredPoint && (
        <div className="absolute top-2 right-2 bg-slate-900/95 border border-emerald-500/40 px-3 py-1.5 rounded-lg shadow-xl pointer-events-none text-right">
          <div className="text-[10px] text-slate-400 font-medium">{hoveredPoint.label}</div>
          <div className="text-xs font-bold text-emerald-400 font-display">
            {formatCurrency(hoveredPoint.value, currencyCode)}
          </div>
        </div>
      )}
    </div>
  );
};
