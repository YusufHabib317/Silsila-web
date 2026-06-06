'use client';

import { apiFetch } from './client';

export type DashboardMoneyTotal = {
  amountMinor: number;
  currency: string;
};

export type DashboardStats = {
  checkedAt: string;
  commissions: {
    approved: number;
    approvedAmount: DashboardMoneyTotal[];
    paid: number;
    paidAmount: DashboardMoneyTotal[];
    pending: number;
    pendingAmount: DashboardMoneyTotal[];
    total: number;
  };
  contacts: {
    agents: number;
    customers: number;
    merchants: number;
    total: number;
  };
  orders: {
    delivered: number;
    grossAmount: DashboardMoneyTotal[];
    needsReview: number;
    open: number;
    paid: number;
    paidAmount: DashboardMoneyTotal[];
    total: number;
  };
  products: {
    active: number;
    draft: number;
    lowStock: number;
    outOfStock: number;
    total: number;
  };
};

export function getDashboardStats() {
  return apiFetch<DashboardStats>('/dashboard/stats');
}
