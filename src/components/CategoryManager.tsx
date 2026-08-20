import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, ArrowUp, ArrowDown, Palette } from 'lucide-react';
import { Category } from '../types';
import { CategoryIcon } from './CategoryIcon';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveCategories: (categories: Category[]) => void;
}

const AVAILABLE_ICONS = [
  'Bus', 'Utensils', 'Wifi', 'PhoneCall', 'Fuel', 'Zap', 'Receipt', 'ShoppingBag',
  'HeartHandshake', 'Users', 'Activity', 'Tv', 'Droplet', 'Home', 'GraduationCap',
  'Globe', 'Film', 'Package', 'Briefcase', 'Car', 'Coffee', 'Gift', 'Shield',
  'Smile', 'Sparkles', 'Tag', 'Truck', 'Wrench', 'Smartphone', 'Coins'
];

const AVAILABLE_COLORS = [
  '#0284c7', '#f97316', '#10b981', '#06b6d4', '#ef4444', '#eab308',
  '#8b5cf6', '#ec4899', '#a855f7', '#14b8a6', '#f43f5e', '#6366f1',
  '#84cc16', '#3b82f6', '#0d9488', '#d946ef', '#64748b', '#f59e0b'
];

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
}) => {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState<string>('Tag');
  const [selectedColor, setSelectedColor] = useState<string>('#10b981');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingCatId(null);
    setName('');
    setSelectedIcon('Tag');
    setSelectedColor('#10b981');
    setErrorMsg('');
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setIsAddingNew(false);
    setName(cat.name);
    setSelectedIcon(cat.icon);
    setSelectedColor(cat.color);
    setErrorMsg('');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required');
      return;
    }

    if (isAddingNew) {
      const newCategory: Category = {
        id: `cat_${Date.now()}`,
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        bgLight: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        isCustom: true,
        order: categories.length + 1,
      };
      onSaveCategories([...categories, newCategory]);
      setIsAddingNew(false);
    } else if (editingCatId) {
      const updated = categories.map((cat) => {
        if (cat.id === editingCatId) {
          return {
            ...cat,
            name: name.trim(),
            icon: selectedIcon,
            color: selectedColor,
          };
        }
        return cat;
      });
      onSaveCategories(updated);
      setEditingCatId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (categories.length <= 1) {
      setErrorMsg('You must have at least one category');
      return;
    }
    const updated = categories.filter((c) => c.id !== id);
    onSaveCategories(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const list = [...categories];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // re-assign order
    const ordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    onSaveCategories(ordered);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Manage Categories
            </h2>
            <p className="text-[11px] text-slate-400">
              Create, customize, reorder, or remove categories
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Add / Edit Form Modal Inline */}
          {(isAddingNew || editingCatId) && (
            <form onSubmit={handleSaveForm} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white">
                  {isAddingNew ? 'Create New Category' : 'Edit Category'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingCatId(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Suya / Snack, Church Offering, Gym..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Select Icon
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-900/60 rounded-xl border border-slate-800">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setSelectedIcon(ic)}
                      className={`p-2 rounded-lg border transition-all ${
                        selectedIcon === ic
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'text-slate-400 hover:text-white border-transparent'
                      }`}
                    >
                      <CategoryIcon name={ic} size={16} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Select Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        selectedColor === col ? 'scale-125 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-md"
              >
                {isAddingNew ? 'Create Category' : 'Save Changes'}
              </button>
            </form>
          )}

          {!isAddingNew && !editingCatId && (
            <button
              onClick={handleStartAdd}
              className="w-full py-3 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-750 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus size={16} /> Add Custom Category
            </button>
          )}

          {/* Existing Categories List */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              Existing Categories ({categories.length})
            </span>

            {categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-850"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    <CategoryIcon name={cat.icon} size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{cat.name}</span>
                    <span className="text-[10px] text-slate-400">Position #{idx + 1}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Reorder Buttons */}
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    disabled={idx === categories.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown size={13} />
                  </button>

                  <button
                    onClick={() => handleStartEdit(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
                    title="Edit category"
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Delete category"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
