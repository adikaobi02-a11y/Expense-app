import React from 'react';
import { Wallet, Bell, Sparkles, RefreshCw } from 'lucide-react';
import { CurrencyCode } from '../types';
import { getCurrencyConfig } from '../utils/currency';

interface HeaderProps {
  currencyCode: CurrencyCode;
  onOpenCurrencyPicker?: () => void;
  monthlyRemaining?: number;
  onRefreshRates?: () => void;
  isUpdatingRates?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currencyCode,
  onOpenCurrencyPicker,
  monthlyRemaining,
  onRefreshRates,
  isUpdatingRates,
}) => {
  const currencyConfig = getCurrencyConfig(currencyCode);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        {/* Left Branding & User Greeting */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 border border-emerald-400/30">
            <Wallet size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-white tracking-tight">
                Naija Spend
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {getGreeting()} • {formattedDate}
            </p>
          </div>
        </div>

        {/* Right Currency & Quick Badges */}
        <div className="flex items-center gap-2">
          {onRefreshRates && (
            <button
              onClick={onRefreshRates}
              disabled={isUpdatingRates}
              className="p-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
              title="Sync Live Rates"
            >
              <RefreshCw size={14} className={isUpdatingRates ? 'animate-spin text-emerald-400' : ''} />
            </button>
          )}

          <button
            onClick={onOpenCurrencyPicker}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-xs font-semibold text-slate-200 shadow-sm transition-all hover:border-emerald-500/40"
          >
            <span className="text-sm">{currencyConfig.flag}</span>
            <span className="font-bold text-emerald-400 font-mono">{currencyConfig.symbol}</span>
            <span className="text-[10px] text-slate-400">{currencyConfig.code}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
