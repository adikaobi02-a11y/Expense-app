import React, { useState, useRef } from 'react';
import {
  Settings,
  Coins,
  Target,
  Palette,
  Bell,
  Download,
  Upload,
  RotateCcw,
  Lock,
  Globe,
  FileSpreadsheet,
  FileText,
  Check,
  RefreshCw,
  ChevronRight,
  Shield,
  Smartphone,
} from 'lucide-react';
import { AppSettings, CurrencyCode, Category, Expense, BudgetConfig } from '../types';
import { SUPPORTED_CURRENCIES } from '../constants/initialData';
import { formatCurrency, fetchLiveExchangeRates } from '../utils/currency';
import { exportExpensesToCSV, exportExpensesToPDF } from '../utils/export';
import { exportDataAsJSON, parseImportJSON } from '../utils/storage';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  expenses: Expense[];
  categories: Category[];
  budget: BudgetConfig;
  onRestoreData: (data: { expenses: Expense[]; categories: Category[]; budget: BudgetConfig; settings: AppSettings }) => void;
  onResetAllData: () => void;
  onOpenCategoryManager: () => void;
  onOpenBudgetsView: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  expenses,
  categories,
  budget,
  onRestoreData,
  onResetAllData,
  onOpenCategoryManager,
  onOpenBudgetsView,
}) => {
  const [isSyncingRates, setIsSyncingRates] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>(settings.pinCode || '');
  const [isEditingPin, setIsEditingPin] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSyncRates = async () => {
    setIsSyncingRates(true);
    const result = await fetchLiveExchangeRates();
    setIsSyncingRates(false);
    if (result) {
      onUpdateSettings({ lastRateUpdate: result.updated });
      setSyncNotice(`Rates synchronized (${result.updated}). Note: Real exchange rates fluctuate.`);
    } else {
      setSyncNotice('Using standard base rates. Live rate service unreachable.');
    }
    setTimeout(() => setSyncNotice(''), 6000);
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseImportJSON(file);
      onRestoreData(data);
      showToast('Backup restored successfully!');
    } catch (err) {
      alert('Failed to import backup file. Please check file format.');
    }
  };

  const handleSavePin = () => {
    if (pinInput.length === 4) {
      onUpdateSettings({ isPinEnabled: true, pinCode: pinInput });
      setIsEditingPin(false);
      showToast('4-Digit Security PIN set successfully!');
    } else {
      alert('PIN must be exactly 4 digits');
    }
  };

  const handleTogglePin = (enabled: boolean) => {
    if (enabled) {
      setIsEditingPin(true);
    } else {
      onUpdateSettings({ isPinEnabled: false, pinCode: undefined });
      setPinInput('');
      showToast('App PIN lock disabled');
    }
  };

  return (
    <div className="space-y-5 pb-28 animate-in fade-in duration-200">
      {/* Header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Settings size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Settings & Preferences
            </h2>
            <p className="text-xs text-slate-400">
              Customize currency, budgets, categories, and exports
            </p>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-in fade-in">
          {toastMsg}
        </div>
      )}

      {/* 1. Currency System Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Coins size={14} className="text-emerald-400" /> Default Currency
            </h3>
            <p className="text-[11px] text-slate-400">Choose primary display currency</p>
          </div>

          <button
            onClick={handleSyncRates}
            disabled={isSyncingRates}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-[11px] font-semibold text-slate-300"
          >
            <RefreshCw size={12} className={isSyncingRates ? 'animate-spin text-emerald-400' : ''} />
            <span>Update Rates</span>
          </button>
        </div>

        {syncNotice && (
          <div className="p-2.5 rounded-xl bg-slate-950 text-[11px] text-slate-300 border border-slate-800">
            {syncNotice}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUPPORTED_CURRENCIES.map((curr) => {
            const isSelected = settings.currency === curr.code;
            return (
              <button
                key={curr.code}
                onClick={() => onUpdateSettings({ currency: curr.code })}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all text-left ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-850 text-slate-300 hover:border-slate-750'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{curr.flag}</span>
                  <div>
                    <span className="text-xs font-bold block">{curr.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {curr.symbol} {curr.code}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Management Shortcuts */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-2.5 shadow-sm">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
          Financial Configuration
        </h3>

        <button
          onClick={onOpenBudgetsView}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-850 border border-slate-850 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Target size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Budget Settings</span>
              <span className="text-[10px] text-slate-400">
                Daily ({formatCurrency(budget.daily, settings.currency)}), Weekly, Monthly
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>

        <button
          onClick={onOpenCategoryManager}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-850 border border-slate-850 transition-all text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Coins size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Categories Manager</span>
              <span className="text-[10px] text-slate-400">
                {categories.length} active Nigerian expense categories
              </span>
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>
      </div>

      {/* 3. Data Export & Backup Reports */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-sm">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Download size={14} className="text-emerald-400" /> Data Export & Backup
          </h3>
          <p className="text-[11px] text-slate-400">Export financial records or create device backup</p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => exportExpensesToCSV(expenses, categories, settings.currency)}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-colors"
          >
            <FileSpreadsheet size={16} className="text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportExpensesToPDF(expenses, categories, settings.currency)}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-colors"
          >
            <FileText size={16} className="text-rose-400" />
            <span>Export PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => exportDataAsJSON({ expenses, categories, budget, settings })}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-colors"
          >
            <Download size={16} className="text-sky-400" />
            <span>JSON Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition-colors"
          >
            <Upload size={16} className="text-amber-400" />
            <span>Restore Backup</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* 4. Privacy & PIN Security */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Lock size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Security PIN Lock</span>
              <span className="text-[10px] text-slate-400">Lock app with 4-digit PIN</span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.isPinEnabled}
              onChange={(e) => handleTogglePin(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {isEditingPin && (
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 mt-2">
            <span className="text-[11px] font-semibold text-slate-300 block">
              Enter 4-Digit Security PIN:
            </span>
            <div className="flex gap-2">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-24 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-center text-base tracking-widest font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleSavePin}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold"
              >
                Set PIN
              </button>
              <button
                onClick={() => setIsEditingPin(false)}
                className="px-2 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. App Language */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-sm">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Globe size={14} className="text-emerald-400" /> Language / Dialect
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'en', label: 'English' },
            { id: 'pidgin', label: 'Naija Pidgin' },
            { id: 'yoruba', label: 'Yorùbá' },
            { id: 'hausa', label: 'Hausa' },
            { id: 'igbo', label: 'Asụsụ Igbo' },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => onUpdateSettings({ language: lang.id as any })}
              className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                settings.language === lang.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                  : 'bg-slate-950 text-slate-400 border-slate-850 hover:border-slate-750'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* 6. Reset Data Danger Zone */}
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Reset Application Data
            </h3>
            <p className="text-[10px] text-slate-400">
              Clear all recorded expenses and restore initial state
            </p>
          </div>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold border border-rose-500/30 transition-colors"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <RotateCcw size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Reset all data?</h3>
              <p className="text-xs text-slate-400">
                This will reset all your custom expenses and budget history. This action cannot be undone.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetAllData();
                  setShowResetConfirm(false);
                  showToast('App data reset to default successfully');
                }}
                className="py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-lg shadow-rose-500/20"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
