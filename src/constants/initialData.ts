import { Category, CurrencyConfig, CurrencyCode, PaymentMethod, Expense, BudgetConfig, AppSettings } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  {
    code: 'NGN',
    name: 'Nigerian Naira',
    symbol: '₦',
    locale: 'en-NG',
    flag: '🇳🇬',
    rateToNgn: 1.0,
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    locale: 'en-US',
    flag: '🇺🇸',
    rateToNgn: 1485.0,
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    locale: 'en-GB',
    flag: '🇬🇧',
    rateToNgn: 1890.0,
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    locale: 'de-DE',
    flag: '🇪🇺',
    rateToNgn: 1610.0,
  },
  {
    code: 'GHS',
    name: 'Ghanaian Cedi',
    symbol: 'GH₵',
    locale: 'en-GH',
    flag: '🇬🇭',
    rateToNgn: 110.0,
  },
  {
    code: 'KES',
    name: 'Kenyan Shilling',
    symbol: 'KSh',
    locale: 'en-KE',
    flag: '🇰🇪',
    rateToNgn: 11.5,
  },
  {
    code: 'ZAR',
    name: 'South African Rand',
    symbol: 'R',
    locale: 'en-ZA',
    flag: '🇿🇦',
    rateToNgn: 82.0,
  },
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { id: 'Cash', label: 'Cash', icon: 'Banknote', desc: 'Paper cash / physical notes' },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: 'ArrowRightLeft', desc: 'Direct bank app / instant transfer' },
  { id: 'POS', label: 'POS Terminal', icon: 'CreditCard', desc: 'Point of sale / merchant card machine' },
  { id: 'Debit Card', label: 'Debit Card', icon: 'Layers', desc: 'ATM / Web debit card payment' },
  { id: 'USSD', label: 'USSD Code', icon: 'Hash', desc: '*737#, *901#, *894# etc.' },
  { id: 'Mobile Wallet', label: 'Mobile Wallet', icon: 'Smartphone', desc: 'Opay, PalmPay, Kuda, Moniepoint' },
  { id: 'Other', label: 'Other', icon: 'MoreHorizontal', desc: 'Vouchers, coupons, barter' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'transport',
    name: 'Transport',
    icon: 'Bus',
    color: '#0284c7', // Sky Blue
    bgLight: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    order: 1,
  },
  {
    id: 'food',
    name: 'Food & Groceries',
    icon: 'Utensils',
    color: '#f97316', // Orange
    bgLight: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    order: 2,
  },
  {
    id: 'data',
    name: 'Mobile Data',
    icon: 'Wifi',
    color: '#10b981', // Emerald
    bgLight: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    order: 3,
  },
  {
    id: 'airtime',
    name: 'Airtime / Recharge',
    icon: 'PhoneCall',
    color: '#06b6d4', // Cyan
    bgLight: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    order: 4,
  },
  {
    id: 'fuel',
    name: 'Fuel / Generator',
    icon: 'Fuel',
    color: '#ef4444', // Red
    bgLight: 'bg-red-500/10 text-red-400 border-red-500/30',
    order: 5,
  },
  {
    id: 'electricity',
    name: 'Electricity / NEPA',
    icon: 'Zap',
    color: '#eab308', // Yellow
    bgLight: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    order: 6,
  },
  {
    id: 'pos_charges',
    name: 'POS / Bank Charges',
    icon: 'Receipt',
    color: '#8b5cf6', // Violet
    bgLight: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
    order: 7,
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#ec4899', // Pink
    bgLight: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
    order: 8,
  },
  {
    id: 'church',
    name: 'Church / Offering / Tithe',
    icon: 'HeartHandshake',
    color: '#a855f7', // Purple
    bgLight: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    order: 9,
  },
  {
    id: 'family',
    name: 'Family & Black Tax',
    icon: 'Users',
    color: '#14b8a6', // Teal
    bgLight: 'bg-teal-500/10 text-teal-400 border-teal-500/30',
    order: 10,
  },
  {
    id: 'health',
    name: 'Medicine / Health',
    icon: 'Activity',
    color: '#f43f5e', // Rose
    bgLight: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    order: 11,
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Outing',
    icon: 'Tv',
    color: '#6366f1', // Indigo
    bgLight: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    order: 12,
  },
  {
    id: 'water',
    name: 'Water',
    icon: 'Droplet',
    color: '#38bdf8', // Light blue
    bgLight: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
    order: 13,
  },
  {
    id: 'rent',
    name: 'Rent & Housing',
    icon: 'Home',
    color: '#84cc16', // Lime
    bgLight: 'bg-lime-500/10 text-lime-400 border-lime-500/30',
    order: 14,
  },
  {
    id: 'education',
    name: 'Education & Courses',
    icon: 'GraduationCap',
    color: '#3b82f6', // Blue
    bgLight: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    order: 15,
  },
  {
    id: 'internet',
    name: 'Internet / Fiber',
    icon: 'Globe',
    color: '#0d9488', // Dark Teal
    bgLight: 'bg-teal-600/10 text-teal-300 border-teal-600/30',
    order: 16,
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions (Netflix/Spotify)',
    icon: 'Film',
    color: '#d946ef', // Fuchsia
    bgLight: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30',
    order: 17,
  },
  {
    id: 'other',
    name: 'Other Expenses',
    icon: 'Package',
    color: '#64748b', // Slate
    bgLight: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    order: 18,
  },
];

export const QUICK_AMOUNT_PRESETS = [
  200, 500, 1000, 1500, 2000, 2500, 3000, 5000, 10000, 20000, 50000,
];

export const QUICK_NOTE_SUGGESTIONS: Record<string, string[]> = {
  transport: ['Danfo bus to CMS', 'Keke napep', 'Uber / Bolt ride', 'BRT card top-up', 'Okada to junction', 'Interstate bus'],
  food: ['Lunch at buka / Mama Put', 'Suya & Cold Drink', 'Amala & Ewedu joint', 'Market soup ingredients', 'Supermarket groceries', 'Shawarma & Smoothie'],
  data: ['MTN 10GB Data Plan', 'Airtel 5GB Night plan', 'Glo Daily plan', '9mobile Data bundle'],
  airtime: ['MTN Airtime ₦1,000', 'Airtel Recharge ₦500', 'Emergency airtime for calls'],
  fuel: ['Fuel for car (PMS)', 'Gen fuel (I pass my neighbor)', 'Diesel 20 Litres', 'Engine oil change'],
  electricity: ['IKEDC Prepaid Token', 'EKEDC Token purchase', 'Estates maintenance & diesel bill'],
  pos_charges: ['POS withdrawal fee ₦100', 'Bank transfer stamp duty ₦50', 'ATM maintenance charge'],
  shopping: ['Toiletries & soap', 'Shoes & clothes', 'Computer Village accessory', 'Balogun Market clothes'],
  church: ['Sunday Tithe', 'Church Offering', 'Midweek fellowship support', 'Mosque Sadaqah'],
  family: ['Monthly upkeep for Mum/Dad', 'Sibling school pocket money', 'Family emergency support'],
  health: ['Malaria medication (Coartem)', 'Paracetamol & Vitamin C', 'Pharmacy prescription', 'Hospital checkup'],
  entertainment: ['Cinema tickets & Popcorn', 'Weekend drinks with guys', 'Game night', 'Beach gate fee'],
};

export const DEFAULT_BUDGET: BudgetConfig = {
  daily: 10000,
  weekly: 60000,
  monthly: 220000,
  incomeMonthly: 300000,
  categoryBudgets: {
    transport: 40000,
    food: 65000,
    data: 15000,
    airtime: 6000,
    fuel: 35000,
    electricity: 15000,
    pos_charges: 3000,
    shopping: 20000,
    family: 25000,
  },
};

export const DEFAULT_SETTINGS: AppSettings = {
  currency: 'NGN',
  theme: 'dark',
  isPinEnabled: false,
  notificationsEnabled: true,
  budgetAlertsEnabled: true,
  alertThresholdPercent: 80,
  soundEffects: true,
  language: 'en',
};

// Helper to generate realistic starter demo expenses
export const generateSampleExpenses = (): Expense[] => {
  const today = new Date();
  const formatDate = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const sampleList: Array<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>> = [
    // Today's expenses (Matches user prompt example: Total ~₦8,750 or ₦10,000)
    {
      amount: 4000,
      currency: 'NGN',
      categoryId: 'transport',
      date: formatDate(0),
      time: '08:15',
      note: 'Uber to Victoria Island office',
      paymentMethod: 'Bank Transfer',
    },
    {
      amount: 3000,
      currency: 'NGN',
      categoryId: 'food',
      date: formatDate(0),
      time: '13:20',
      note: 'Lunch at Mama Put (Amala, goat meat)',
      paymentMethod: 'POS',
    },
    {
      amount: 1500,
      currency: 'NGN',
      categoryId: 'data',
      date: formatDate(0),
      time: '15:45',
      note: 'MTN 2.5GB daily data renewal',
      paymentMethod: 'Mobile Wallet',
    },
    {
      amount: 500,
      currency: 'NGN',
      categoryId: 'airtime',
      date: formatDate(0),
      time: '18:10',
      note: 'Emergency recharge card',
      paymentMethod: 'USSD',
    },
    {
      amount: 1000,
      currency: 'NGN',
      categoryId: 'other',
      date: formatDate(0),
      time: '19:30',
      note: 'Newspaper & cold pure water / drink',
      paymentMethod: 'Cash',
    },

    // Yesterday
    {
      amount: 6500,
      currency: 'NGN',
      categoryId: 'fuel',
      date: formatDate(1),
      time: '07:45',
      note: 'Generator fuel 8 Litres (PMS)',
      paymentMethod: 'POS',
    },
    {
      amount: 2800,
      currency: 'NGN',
      categoryId: 'food',
      date: formatDate(1),
      time: '12:40',
      note: 'Fried rice & chicken with colleagues',
      paymentMethod: 'Debit Card',
    },
    {
      amount: 1200,
      currency: 'NGN',
      categoryId: 'transport',
      date: formatDate(1),
      time: '17:50',
      note: 'Keke and Danfo fare home',
      paymentMethod: 'Cash',
    },
    {
      amount: 200,
      currency: 'NGN',
      categoryId: 'pos_charges',
      date: formatDate(1),
      time: '17:55',
      note: 'POS cash withdrawal fee',
      paymentMethod: 'Cash',
    },

    // 2 days ago
    {
      amount: 8000,
      currency: 'NGN',
      categoryId: 'electricity',
      date: formatDate(2),
      time: '10:15',
      note: 'IKEDC Prepaid Token 38 units',
      paymentMethod: 'Bank Transfer',
    },
    {
      amount: 3500,
      currency: 'NGN',
      categoryId: 'food',
      date: formatDate(2),
      time: '14:00',
      note: 'Market soup ingredients (Egusi & stockfish)',
      paymentMethod: 'Cash',
    },
    {
      amount: 2000,
      currency: 'NGN',
      categoryId: 'transport',
      date: formatDate(2),
      time: '18:30',
      note: 'Bolt ride due to heavy rain',
      paymentMethod: 'Bank Transfer',
    },

    // 3 days ago
    {
      amount: 15000,
      currency: 'NGN',
      categoryId: 'family',
      date: formatDate(3),
      time: '09:00',
      note: 'Upkeep transfer for Mama in village',
      paymentMethod: 'Bank Transfer',
    },
    {
      amount: 4500,
      currency: 'NGN',
      categoryId: 'health',
      date: formatDate(3),
      time: '16:20',
      note: 'Malaria medication & Vitamin C from Medplus',
      paymentMethod: 'POS',
    },

    // 4 days ago
    {
      amount: 5000,
      currency: 'NGN',
      categoryId: 'church',
      date: formatDate(4),
      time: '11:30',
      note: 'Sunday thanksgiving offering',
      paymentMethod: 'Bank Transfer',
    },
    {
      amount: 7200,
      currency: 'NGN',
      categoryId: 'entertainment',
      date: formatDate(4),
      time: '19:00',
      note: 'Suya spot with family & malt',
      paymentMethod: 'POS',
    },

    // 6 days ago
    {
      amount: 12500,
      currency: 'NGN',
      categoryId: 'shopping',
      date: formatDate(6),
      time: '15:10',
      note: 'New shirts & toiletries at supermarket',
      paymentMethod: 'Debit Card',
    },
    {
      amount: 3500,
      currency: 'NGN',
      categoryId: 'data',
      date: formatDate(6),
      time: '20:00',
      note: 'Airtel Monthly 20GB router data',
      paymentMethod: 'Mobile Wallet',
    },
  ];

  return sampleList.map((item, index) => ({
    ...item,
    id: `exp_${Date.now() - index * 3600000}_${index}`,
    createdAt: Date.now() - index * 86400000,
    updatedAt: Date.now() - index * 86400000,
  }));
};
