import React from 'react';
import { Home, ReceiptText, BarChart3, Settings, Plus } from 'lucide-react';

export type NavTab = 'home' | 'expenses' | 'analytics' | 'settings';

interface NavigationProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  onOpenAddExpense: () => void;
  todayExpenseCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddExpense,
  todayExpenseCount = 0,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    {
      id: 'expenses' as NavTab,
      label: 'Expenses',
      icon: ReceiptText,
      badge: todayExpenseCount > 0 ? todayExpenseCount : undefined,
    },
    // Center FAB placeholder spacer
    { id: 'analytics' as NavTab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 max-w-lg mx-auto pb-safe">
      <div className="flex items-center justify-around px-2 py-2 relative">
        {/* First 2 tabs */}
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center border-2 border-slate-900">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 animate-pulse-subtle" />
              )}
            </button>
          );
        })}

        {/* Prominent Floating Center '+' Action Button */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            id="fab-add-expense"
            onClick={onOpenAddExpense}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all border-4 border-slate-900 cursor-pointer"
            title="Record New Expense"
          >
            <Plus size={28} strokeWidth={2.8} />
          </button>
        </div>

        {/* Next 2 tabs */}
        {tabs.slice(2).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all ${
                isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 animate-pulse-subtle" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
