import React, { useState, useEffect } from 'react';
import { X, Check, Clock, Calendar, ChevronDown, Sparkles, Tag, Plus } from 'lucide-react';
import { Expense, Category, PaymentMethod, CurrencyCode } from '../types';
import { PAYMENT_METHODS, QUICK_AMOUNT_PRESETS, QUICK_NOTE_SUGGESTIONS } from '../constants/initialData';
import { formatCurrency, getCurrencyConfig } from '../utils/currency';
import { toLocalDateString } from '../utils/calculations';
import { CategoryIcon } from './CategoryIcon';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>, idToEdit?: string) => void;
  categories: Category[];
  currencyCode: CurrencyCode;
  expenseToEdit?: Expense | null;
  onOpenCategoryManager?: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSaveExpense,
  categories,
  currencyCode,
  expenseToEdit,
  onOpenCategoryManager,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('transport');
  const [dateStr, setDateStr] = useState<string>(toLocalDateString(new Date()));
  const [timeStr, setTimeStr] = useState<string>('12:00');
  const [note, setNote] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const currencyConfig = getCurrencyConfig(currencyCode);

  useEffect(() => {
    if (expenseToEdit) {
      setAmountStr(String(expenseToEdit.amount));
      setSelectedCategoryId(expenseToEdit.categoryId);
      setDateStr(expenseToEdit.date);
      setTimeStr(expenseToEdit.time || '12:00');
      setNote(expenseToEdit.note || '');
      setPaymentMethod(expenseToEdit.paymentMethod || 'Cash');
      setShowAdvanced(true);
    } else {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');

      setAmountStr('');
      setSelectedCategoryId(categories[0]?.id || 'transport');
      setDateStr(toLocalDateString(now));
      setTimeStr(`${hours}:${mins}`);
      setNote('');
      setPaymentMethod('Bank Transfer'); // Very common default in Nigeria
      setShowAdvanced(false);
    }
    setErrorMsg('');
  }, [isOpen, expenseToEdit, categories]);

  if (!isOpen) return null;

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + addValue));
    setErrorMsg('');
  };

  const handleClearAmount = () => {
    setAmountStr('');
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setNote(suggestion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amountStr);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg('Please enter a valid expense amount');
      return;
    }

    if (!selectedCategoryId) {
      setErrorMsg('Please select an expense category');
      return;
    }

    onSaveExpense(
      {
        amount: parsedAmount,
        currency: currencyCode,
        categoryId: selectedCategoryId,
        date: dateStr,
        time: timeStr,
        note: note.trim() || undefined,
        paymentMethod,
      },
      expenseToEdit?.id
    );

    onClose();
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];
  const suggestions = QUICK_NOTE_SUGGESTIONS[selectedCategoryId] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="add-expense-modal"
        className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: selectedCategory?.color || '#10b981' }}
            >
              <CategoryIcon name={selectedCategory?.icon || 'CircleDollarSign'} size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {expenseToEdit ? 'Edit Expense' : 'Record Daily Expense'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {selectedCategory?.name || 'Quick Kudi Record'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Main Amount Input Hero */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center relative focus-within:border-emerald-500/60 transition-colors">
            <span className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider block mb-1">
              Amount Spent ({currencyCode})
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display">
                {currencyConfig.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="1"
                placeholder="0"
                value={amountStr}
                onChange={(e) => {
                  setAmountStr(e.target.value);
                  setErrorMsg('');
                }}
                autoFocus
                className="w-48 sm:w-60 text-3xl sm:text-4xl font-extrabold text-white bg-transparent border-none text-center focus:outline-none placeholder-slate-700 font-display tracking-tight"
              />
              {amountStr && (
                <button
                  type="button"
                  onClick={handleClearAmount}
                  className="text-xs text-slate-500 hover:text-slate-300 px-1.5 py-0.5 rounded bg-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Amount Add Pills */}
            <div className="mt-3.5 flex flex-wrap gap-1.5 justify-center">
              {[200, 500, 1000, 2000, 5000, 10000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-750 text-[11px] font-semibold text-slate-300 border border-slate-750 hover:border-emerald-500/40 transition-colors active:scale-95"
                >
                  +{formatCurrency(val, currencyCode, { showSymbol: true })}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs font-semibold text-rose-400 text-center animate-shake">
              {errorMsg}
            </div>
          )}

          {/* Category Picker Grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Category
              </label>
              {onOpenCategoryManager && (
                <button
                  type="button"
                  onClick={onOpenCategoryManager}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <Plus size={12} /> Manage
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1 pr-2">
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setErrorMsg('');
                    }}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 shadow-sm shadow-emerald-500/20 text-white scale-[1.02]'
                        : 'border-slate-800/90 bg-slate-850/60 hover:bg-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white mb-1.5"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} size={16} />
                    </div>
                    <span className="text-[11px] font-semibold truncate w-full">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                        : 'bg-slate-850/80 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <CategoryIcon name={pm.icon} size={13} />
                    <span>{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Note & Suggestion Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Note / Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Danfo fare, Mama Put lunch, Generator fuel..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/70"
            />

            {/* Nigerian Suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[10px] text-slate-500 flex items-center gap-1 mr-1">
                  <Tag size={10} /> Suggestions:
                </span>
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => handleSelectSuggestion(sug)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 hover:text-emerald-400 hover:bg-slate-750 transition-colors border border-slate-750"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date & Time Selector */}
          <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/80">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Calendar size={12} /> Date
              </label>
              <input
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                <Clock size={12} /> Time
              </label>
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Large Submit Button */}
          <div className="pt-2">
            <button
              id="save-expense-btn"
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check size={18} strokeWidth={2.5} />
              <span>
                {expenseToEdit
                  ? 'Update Expense'
                  : amountStr
                  ? `Record ${formatCurrency(parseFloat(amountStr) || 0, currencyCode)} Expense`
                  : 'Add Expense'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
