import type { DashboardMoneyTotal, DashboardStats } from '@/lib/api/dashboard';

export const EMPTY_DASHBOARD_STATS: DashboardStats = {
  checkedAt: '',
  commissions: {
    approved: 0,
    approvedAmount: [],
    paid: 0,
    paidAmount: [],
    pending: 0,
    pendingAmount: [],
    total: 0,
  },
  contacts: {
    agents: 0,
    customers: 0,
    merchants: 0,
    total: 0,
  },
  orders: {
    delivered: 0,
    grossAmount: [],
    needsReview: 0,
    open: 0,
    paid: 0,
    paidAmount: [],
    total: 0,
  },
  products: {
    active: 0,
    draft: 0,
    lowStock: 0,
    outOfStock: 0,
    total: 0,
  },
};

export function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

function formatMoneyAmount(
  amountMinor: number,
  currency: string,
  locale: string,
) {
  const amount = amountMinor / 100;

  try {
    return new Intl.NumberFormat(locale, {
      currency,
      style: 'currency',
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${currency}`;
  }
}

export function formatMoneyTotals(
  totals: DashboardMoneyTotal[],
  locale: string,
) {
  if (totals.length === 0) {
    return formatNumber(0, locale);
  }

  const visibleTotals = totals
    .slice(0, 2)
    .map((total) =>
      formatMoneyAmount(total.amountMinor, total.currency, locale),
    );
  const hiddenCurrencyCount = totals.length - visibleTotals.length;

  if (hiddenCurrencyCount > 0) {
    visibleTotals.push(`+${hiddenCurrencyCount}`);
  }

  return visibleTotals.join(' / ');
}

export function formatCheckedAt(value: string, locale: string) {
  if (!value) {
    return 'Not loaded yet';
  }

  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}
