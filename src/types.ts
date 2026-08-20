export type CurrencyCode = 'NGN' | 'USD' | 'GBP' | 'EUR' | 'GHS' | 'KES' | 'ZAR';

export interface CurrencyConfig {
  code: CurrencyCode;
  name: string;
  symbol: string;
  locale: string;
  flag: string;
  rateToNgn: number; // For conversion preview
}

export type PaymentMethod =
  | 'Cash'
  | 'Bank Transfer'
  | 'POS'
  | 'Debit Card'
  | 'USSD'
  | 'Mobile Wallet'
  | 'Other';

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Hex or Tailwind color class
  bgLight: string;
  isCustom?: boolean;
  order: number;
}

export interface Expense {
  id: string;
  amount: number;
  currency: CurrencyCode;
  categoryId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24hr or 12hr)
  note?: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
  updatedAt: number;
}

export interface BudgetConfig {
  daily: number;
  weekly: number;
  monthly: number;
  categoryBudgets: Record<string, number>; // categoryId -> monthly budget amount
  incomeMonthly?: number;
}

export interface AppSettings {
  currency: CurrencyCode;
  theme: 'light' | 'dark' | 'system';
  isPinEnabled: boolean;
  pinCode?: string;
  notificationsEnabled: boolean;
  budgetAlertsEnabled: boolean;
  alertThresholdPercent: number; // e.g. 80
  soundEffects: boolean;
  language: 'en' | 'pidgin' | 'yoruba' | 'hausa' | 'igbo';
  lastRateUpdate?: string;
}

export type TimeFrame = 'today' | 'week' | 'month' | 'year' | 'all';

export interface CategorySpending {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  total: number;
  count: number;
  percentage: number;
  budget?: number;
  percentOfBudget?: number;
}

export interface SpendingSummary {
  totalToday: number;
  totalWeek: number;
  totalMonth: number;
  totalYear: number;
  totalAllTime: number;
  todayCount: number;
  weekCount: number;
  monthCount: number;
  categoryBreakdown: CategorySpending[];
  highestCategory?: CategorySpending;
  averageDaily: number;
  remainingDailyBudget: number;
  remainingWeeklyBudget: number;
  remainingMonthlyBudget: number;
  dailyBudgetUtilization: number;
  weeklyBudgetUtilization: number;
  monthlyBudgetUtilization: number;
}

export interface SmartInsight {
  id: string;
  type: 'info' | 'warning' | 'tip' | 'success';
  title: string;
  message: string;
  iconName: string;
  actionText?: string;
  actionPayload?: string;
}

export interface ExpenseFilter {
  searchQuery: string;
  categoryId: string | 'all';
  paymentMethod: PaymentMethod | 'all';
  startDate: string;
  endDate: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}
