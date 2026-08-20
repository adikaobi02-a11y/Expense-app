import { Expense, Category, BudgetConfig, SpendingSummary, CategorySpending, SmartInsight, TimeFrame, CurrencyCode } from '../types';
import { formatCurrency } from './currency';

/**
 * Normalizes a date object or ISO string to YYYY-MM-DD format in local time
 */
export const toLocalDateString = (d: Date | string): string => {
  const dateObj = typeof d === 'string' ? new Date(d.replace(/-/g, '/')) : d;
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if two date strings represent the same day
 */
export const isSameDay = (d1: string, d2: string): boolean => {
  return d1.slice(0, 10) === d2.slice(0, 10);
};

/**
 * Returns the start of the week (Monday) for a given date
 */
export const getStartOfWeek = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

/**
 * Calculates complete summary of spendings across intervals and categories
 */
export const calculateSpendingSummary = (
  expenses: Expense[],
  categories: Category[],
  budget: BudgetConfig,
  currentCurrency: CurrencyCode = 'NGN'
): SpendingSummary => {
  const now = new Date();
  const todayStr = toLocalDateString(now);

  const startOfWeek = getStartOfWeek(now);
  const startOfWeekStr = toLocalDateString(startOfWeek);

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const startOfMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
  const startOfYearStr = `${currentYear}-01-01`;

  let totalToday = 0;
  let totalWeek = 0;
  let totalMonth = 0;
  let totalYear = 0;
  let totalAllTime = 0;

  let todayCount = 0;
  let weekCount = 0;
  let monthCount = 0;

  // Track category sums for today & this month
  const categoryMonthlyMap = new Map<string, { total: number; count: number }>();
  const categoryTodayMap = new Map<string, { total: number; count: number }>();

  // Distinct days with expenses for average daily calculation
  const monthlyExpenseDays = new Set<string>();

  expenses.forEach((exp) => {
    const expDate = exp.date;
    const amount = exp.amount;

    totalAllTime += amount;

    if (expDate >= startOfYearStr) {
      totalYear += amount;
    }

    if (expDate >= startOfMonthStr) {
      totalMonth += amount;
      monthCount++;
      monthlyExpenseDays.add(expDate);

      const existing = categoryMonthlyMap.get(exp.categoryId) || { total: 0, count: 0 };
      categoryMonthlyMap.set(exp.categoryId, {
        total: existing.total + amount,
        count: existing.count + 1,
      });
    }

    if (expDate >= startOfWeekStr) {
      totalWeek += amount;
      weekCount++;
    }

    if (isSameDay(expDate, todayStr)) {
      totalToday += amount;
      todayCount++;

      const existingToday = categoryTodayMap.get(exp.categoryId) || { total: 0, count: 0 };
      categoryTodayMap.set(exp.categoryId, {
        total: existingToday.total + amount,
        count: existingToday.count + 1,
      });
    }
  });

  // Calculate Category Breakdowns for the primary active period (month or today if preferred)
  // We compute based on monthly total if available, otherwise all-time
  const baseTotal = totalMonth > 0 ? totalMonth : totalToday > 0 ? totalToday : 1;
  const activeMap = totalMonth > 0 ? categoryMonthlyMap : categoryTodayMap;

  const categoryBreakdown: CategorySpending[] = categories
    .map((cat) => {
      const data = activeMap.get(cat.id) || { total: 0, count: 0 };
      const percentage = baseTotal > 0 && data.total > 0 ? (data.total / baseTotal) * 100 : 0;
      const catBudget = budget.categoryBudgets[cat.id] || 0;
      const percentOfBudget = catBudget > 0 ? (data.total / catBudget) * 100 : undefined;

      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        total: data.total,
        count: data.count,
        percentage: Number(percentage.toFixed(1)),
        budget: catBudget > 0 ? catBudget : undefined,
        percentOfBudget: percentOfBudget !== undefined ? Number(percentOfBudget.toFixed(1)) : undefined,
      };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const highestCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : undefined;

  // Average daily spending over elapsed days this month
  const dayOfMonth = now.getDate();
  const averageDaily = dayOfMonth > 0 ? Math.round(totalMonth / dayOfMonth) : totalToday;

  const remainingDailyBudget = budget.daily - totalToday;
  const remainingWeeklyBudget = budget.weekly - totalWeek;
  const remainingMonthlyBudget = budget.monthly - totalMonth;

  const dailyBudgetUtilization = budget.daily > 0 ? (totalToday / budget.daily) * 100 : 0;
  const weeklyBudgetUtilization = budget.weekly > 0 ? (totalWeek / budget.weekly) * 100 : 0;
  const monthlyBudgetUtilization = budget.monthly > 0 ? (totalMonth / budget.monthly) * 100 : 0;

  return {
    totalToday,
    totalWeek,
    totalMonth,
    totalYear,
    totalAllTime,
    todayCount,
    weekCount,
    monthCount,
    categoryBreakdown,
    highestCategory,
    averageDaily,
    remainingDailyBudget,
    remainingWeeklyBudget,
    remainingMonthlyBudget,
    dailyBudgetUtilization: Number(dailyBudgetUtilization.toFixed(1)),
    weeklyBudgetUtilization: Number(weeklyBudgetUtilization.toFixed(1)),
    monthlyBudgetUtilization: Number(monthlyBudgetUtilization.toFixed(1)),
  };
};

/**
 * Filter and compute category percentages for any custom time period
 */
export const getBreakdownForTimeframe = (
  expenses: Expense[],
  categories: Category[],
  timeframe: TimeFrame
): { breakdown: CategorySpending[]; total: number } => {
  const now = new Date();
  const todayStr = toLocalDateString(now);
  const startOfWeekStr = toLocalDateString(getStartOfWeek(now));
  const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const startOfYearStr = `${now.getFullYear()}-01-01`;

  const filtered = expenses.filter((exp) => {
    if (timeframe === 'today') return isSameDay(exp.date, todayStr);
    if (timeframe === 'week') return exp.date >= startOfWeekStr;
    if (timeframe === 'month') return exp.date >= startOfMonthStr;
    if (timeframe === 'year') return exp.date >= startOfYearStr;
    return true; // 'all'
  });

  const total = filtered.reduce((acc, curr) => acc + curr.amount, 0);
  const catMap = new Map<string, { total: number; count: number }>();

  filtered.forEach((exp) => {
    const existing = catMap.get(exp.categoryId) || { total: 0, count: 0 };
    catMap.set(exp.categoryId, {
      total: existing.total + exp.amount,
      count: existing.count + 1,
    });
  });

  const breakdown: CategorySpending[] = categories
    .map((cat) => {
      const data = catMap.get(cat.id) || { total: 0, count: 0 };
      const percentage = total > 0 ? (data.total / total) * 100 : 0;
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        categoryIcon: cat.icon,
        categoryColor: cat.color,
        total: data.total,
        count: data.count,
        percentage: Number(percentage.toFixed(1)),
      };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  return { breakdown, total };
};

/**
 * Generate smart, culturally relevant Nigerian spending observations and insights
 */
export const generateSmartInsights = (
  expenses: Expense[],
  categories: Category[],
  summary: SpendingSummary,
  budget: BudgetConfig,
  currencyCode: CurrencyCode = 'NGN'
): SmartInsight[] => {
  const insights: SmartInsight[] = [];
  if (expenses.length === 0) return insights;

  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const startOfWeekStr = toLocalDateString(startOfWeek);

  // Last week range
  const lastWeekStart = new Date(startOfWeek);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekStartStr = toLocalDateString(lastWeekStart);

  // 1. Budget Utilization Warnings
  if (summary.monthlyBudgetUtilization >= 90) {
    insights.push({
      id: 'budget-critical',
      type: 'warning',
      title: 'Monthly Budget Alert',
      message: `Omo! You have used ${summary.monthlyBudgetUtilization}% of your monthly budget. Only ${formatCurrency(summary.remainingMonthlyBudget, currencyCode)} left!`,
      iconName: 'AlertTriangle',
    });
  } else if (summary.monthlyBudgetUtilization >= 75) {
    insights.push({
      id: 'budget-warning',
      type: 'warning',
      title: 'Budget Running High',
      message: `You have spent ${summary.monthlyBudgetUtilization}% of your monthly budget (${formatCurrency(summary.totalMonth, currencyCode)} / ${formatCurrency(budget.monthly, currencyCode)}).`,
      iconName: 'TrendingUp',
    });
  } else if (summary.remainingMonthlyBudget > 0 && summary.totalMonth > 0) {
    insights.push({
      id: 'budget-healthy',
      type: 'success',
      title: 'Budget On Track',
      message: `You have ${formatCurrency(summary.remainingMonthlyBudget, currencyCode)} remaining from your monthly budget. Keep it up!`,
      iconName: 'ShieldCheck',
    });
  }

  // 2. Highest Spending Category
  if (summary.highestCategory && summary.highestCategory.percentage >= 20) {
    insights.push({
      id: 'top-category',
      type: 'info',
      title: 'Top Expense Category',
      message: `${summary.highestCategory.categoryName} represents ${summary.highestCategory.percentage}% (${formatCurrency(summary.highestCategory.total, currencyCode)}) of your total spending.`,
      iconName: 'PieChart',
    });
  }

  // 3. Weekly Comparison for Transport / Food
  const transportExpensesThisWeek = expenses
    .filter((e) => e.categoryId === 'transport' && e.date >= startOfWeekStr)
    .reduce((sum, e) => sum + e.amount, 0);

  const transportExpensesLastWeek = expenses
    .filter((e) => e.categoryId === 'transport' && e.date >= lastWeekStartStr && e.date < startOfWeekStr)
    .reduce((sum, e) => sum + e.amount, 0);

  if (transportExpensesThisWeek > 0 && transportExpensesLastWeek > 0) {
    const diff = transportExpensesThisWeek - transportExpensesLastWeek;
    if (diff > 0) {
      insights.push({
        id: 'transport-trend-up',
        type: 'warning',
        title: 'Transport Spending',
        message: `You spent ${formatCurrency(diff, currencyCode)} more on transport this week than last week.`,
        iconName: 'Car',
      });
    } else if (diff < 0) {
      insights.push({
        id: 'transport-trend-down',
        type: 'success',
        title: 'Transport Savings',
        message: `Good move! You saved ${formatCurrency(Math.abs(diff), currencyCode)} on transport compared to last week.`,
        iconName: 'CheckCircle2',
      });
    }
  }

  // 4. POS / Bank Charges tracker (Very relevant in Nigeria)
  const posExpensesThisMonth = expenses
    .filter((e) => (e.categoryId === 'pos_charges' || e.paymentMethod === 'POS') && e.date >= toLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1)))
    .reduce((sum, e) => sum + (e.categoryId === 'pos_charges' ? e.amount : 0), 0);

  if (posExpensesThisMonth >= 500) {
    insights.push({
      id: 'pos-charges-tracker',
      type: 'tip',
      title: 'POS & Bank Charges',
      message: `POS fees and bank stamp duties took ${formatCurrency(posExpensesThisMonth, currencyCode)} this month. Consider fewer, larger withdrawals or transfers.`,
      iconName: 'Receipt',
    });
  }

  // 5. Daily Average
  if (summary.averageDaily > 0) {
    insights.push({
      id: 'daily-average',
      type: 'info',
      title: 'Daily Spending Rhythm',
      message: `Your average daily spending is ${formatCurrency(summary.averageDaily, currencyCode)} per day this month.`,
      iconName: 'Calendar',
    });
  }

  return insights;
};

/**
 * Group expenses by relative date string (Today, Yesterday, Date)
 */
export const groupExpensesByDate = (expenses: Expense[]): { dateLabel: string; rawDate: string; items: Expense[]; dayTotal: number }[] => {
  const groupsMap = new Map<string, Expense[]>();
  const now = new Date();
  const todayStr = toLocalDateString(now);

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = toLocalDateString(yesterday);

  expenses.forEach((exp) => {
    const list = groupsMap.get(exp.date) || [];
    list.push(exp);
    groupsMap.set(exp.date, list);
  });

  const sortedDates = Array.from(groupsMap.keys()).sort((a, b) => b.localeCompare(a));

  return sortedDates.map((dateKey) => {
    let dateLabel = dateKey;
    if (dateKey === todayStr) {
      dateLabel = 'Today';
    } else if (dateKey === yesterdayStr) {
      dateLabel = 'Yesterday';
    } else {
      const d = new Date(dateKey.replace(/-/g, '/'));
      dateLabel = d.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    }

    const items = (groupsMap.get(dateKey) || []).sort((a, b) => {
      if (a.time && b.time) return b.time.localeCompare(a.time);
      return b.createdAt - a.createdAt;
    });

    const dayTotal = items.reduce((sum, item) => sum + item.amount, 0);

    return {
      dateLabel,
      rawDate: dateKey,
      items,
      dayTotal,
    };
  });
};
