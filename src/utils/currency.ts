import { CurrencyCode, CurrencyConfig } from '../types';
import { SUPPORTED_CURRENCIES } from '../constants/initialData';

export const getCurrencyConfig = (code?: string | CurrencyCode): CurrencyConfig => {
  const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
  return found || SUPPORTED_CURRENCIES[0];
};

/**
 * Natural Nigerian amount formatting.
 * Examples: ₦1,500, ₦10,000, ₦125,500, ₦1,250,000.00
 */
export const formatCurrency = (
  amount: number,
  currencyCode?: string | CurrencyCode,
  options: { showSymbol?: boolean; decimals?: number; compact?: boolean } = {}
): string => {
  const { showSymbol = true, decimals = 0, compact = false } = options;
  const config = getCurrencyConfig(currencyCode as CurrencyCode);

  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSymbol ? `${config.symbol}0` : '0';
  }

  if (compact && Math.abs(amount) >= 1_000_000) {
    const formatted = (amount / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return showSymbol ? `${config.symbol}${formatted}M` : `${formatted}M`;
  }

  if (compact && Math.abs(amount) >= 100_000) {
    const formatted = (amount / 1_000).toFixed(0);
    return showSymbol ? `${config.symbol}${formatted}k` : `${formatted}k`;
  }

  const rounded = Number(amount.toFixed(decimals));
  const parts = rounded.toLocaleString(config.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `${config.symbol}${parts}` : parts;
};

/**
 * Parse input strings like "1,500" or "₦ 2000" into numeric value
 */
export const parseAmountInput = (input: string): number => {
  if (!input) return 0;
  const cleaned = input.replace(/[^0-9.]/g, '');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
};

/**
 * Convert an amount in NGN to another currency (or vice-versa)
 */
export const convertCurrency = (
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): number => {
  if (from === to) return amount;
  const fromConfig = getCurrencyConfig(from);
  const toConfig = getCurrencyConfig(to);

  // Convert to NGN base first
  const amountInNgn = amount * fromConfig.rateToNgn;
  // Convert from NGN to target
  return amountInNgn / toConfig.rateToNgn;
};

/**
 * Fetch live exchange rates from public API (with fallback)
 */
export async function fetchLiveExchangeRates(): Promise<{ rates: Record<string, number>; updated: string } | null> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    if (data && data.rates && data.rates.NGN) {
      const usdToNgn = data.rates.NGN;
      // Calculate rateToNgn for our currencies
      const calculatedRates: Record<string, number> = {
        NGN: 1.0,
        USD: usdToNgn,
        GBP: (usdToNgn / data.rates.GBP),
        EUR: (usdToNgn / data.rates.EUR),
        GHS: (usdToNgn / (data.rates.GHS || 15.5)),
        KES: (usdToNgn / (data.rates.KES || 130)),
        ZAR: (usdToNgn / (data.rates.ZAR || 18)),
      };
      return {
        rates: calculatedRates,
        updated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      };
    }
    return null;
  } catch (err) {
    console.warn('Could not fetch live exchange rates, using offline defaults', err);
    return null;
  }
}
