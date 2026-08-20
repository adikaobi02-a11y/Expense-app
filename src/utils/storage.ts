import { Expense, Category, BudgetConfig, AppSettings } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_BUDGET, DEFAULT_SETTINGS, generateSampleExpenses } from '../constants/initialData';

const STORAGE_KEYS = {
  EXPENSES: 'naija_tracker_expenses_v2',
  CATEGORIES: 'naija_tracker_categories_v2',
  BUDGET: 'naija_tracker_budget_v2',
  SETTINGS: 'naija_tracker_settings_v2',
  HAS_INITIALIZED: 'naija_tracker_initialized_v2',
};

export const loadStoredData = () => {
  try {
    const hasInit = localStorage.getItem(STORAGE_KEYS.HAS_INITIALIZED);

    // Initial first-time load: populate with realistic starter demo data
    if (!hasInit) {
      const initialExpenses = generateSampleExpenses();
      saveExpenses(initialExpenses);
      saveCategories(DEFAULT_CATEGORIES);
      saveBudget(DEFAULT_BUDGET);
      saveSettings(DEFAULT_SETTINGS);
      localStorage.setItem(STORAGE_KEYS.HAS_INITIALIZED, 'true');

      return {
        expenses: initialExpenses,
        categories: DEFAULT_CATEGORIES,
        budget: DEFAULT_BUDGET,
        settings: DEFAULT_SETTINGS,
      };
    }

    const rawExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    const rawCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    const rawBudget = localStorage.getItem(STORAGE_KEYS.BUDGET);
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    const expenses: Expense[] = rawExpenses ? JSON.parse(rawExpenses) : [];
    const categories: Category[] = rawCategories ? JSON.parse(rawCategories) : DEFAULT_CATEGORIES;
    const budget: BudgetConfig = rawBudget ? JSON.parse(rawBudget) : DEFAULT_BUDGET;
    const settings: AppSettings = rawSettings ? JSON.parse(rawSettings) : DEFAULT_SETTINGS;

    return { expenses, categories, budget, settings };
  } catch (error) {
    console.error('Error loading stored data:', error);
    return {
      expenses: generateSampleExpenses(),
      categories: DEFAULT_CATEGORIES,
      budget: DEFAULT_BUDGET,
      settings: DEFAULT_SETTINGS,
    };
  }
};

export const saveExpenses = (expenses: Expense[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to persist expenses', e);
  }
};

export const saveCategories = (categories: Category[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to persist categories', e);
  }
};

export const saveBudget = (budget: BudgetConfig) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(budget));
  } catch (e) {
    console.error('Failed to persist budget', e);
  }
};

export const saveSettings = (settings: AppSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to persist settings', e);
  }
};

export const resetAllDataToDefault = () => {
  localStorage.clear();
  return loadStoredData();
};

export const exportDataAsJSON = (data: {
  expenses: Expense[];
  categories: Category[];
  budget: BudgetConfig;
  settings: AppSettings;
}) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Naija_Expense_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const parseImportJSON = async (file: File): Promise<{
  expenses: Expense[];
  categories: Category[];
  budget: BudgetConfig;
  settings: AppSettings;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (!parsed || !Array.isArray(parsed.expenses)) {
          throw new Error('Invalid backup file format');
        }
        resolve(parsed);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};
