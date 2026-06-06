import type { ListCommissionsParams } from '@/lib/api/commissions';
import type {
  CreateCommissionRequest,
  UpdateCommissionRequest,
} from '@/lib/api/types';

import type { CommissionFormValues } from './commission-form-types';
import {
  COMMISSION_FILTER_ALL,
  type CommissionStatusFilter,
  type CommissionTypeFilter,
} from './commissions-ui';

export const COMMISSION_PAGE_LIMIT = 50;

export type CommissionFilters = {
  contactId: string | null;
  currency: string;
  orderId: string | null;
  productId: string | null;
  statusFilter: CommissionStatusFilter;
  typeFilter: CommissionTypeFilter;
};

export function buildCommissionParams(
  filters: CommissionFilters,
  cursor: string | null,
): ListCommissionsParams {
  const params: ListCommissionsParams = {
    cursor,
    limit: COMMISSION_PAGE_LIMIT,
  };
  const currency = filters.currency.trim();

  if (filters.statusFilter !== COMMISSION_FILTER_ALL) {
    params.status = filters.statusFilter;
  }

  if (filters.typeFilter !== COMMISSION_FILTER_ALL) {
    params.commissionType = filters.typeFilter;
  }

  if (filters.contactId) {
    params.contactId = filters.contactId;
  }

  if (filters.orderId) {
    params.orderId = filters.orderId;
  }

  if (filters.productId) {
    params.productId = filters.productId;
  }

  if (currency) {
    params.currency = currency.toUpperCase();
  }

  return params;
}

function cleanText(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue || null;
}

function toAmountMinor(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return Math.round(Number(trimmedValue) * 100);
}

function toPercentage(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return Number(trimmedValue);
}

function toIsoDateTime(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  const date = new Date(trimmedValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function buildCommissionValueFields(values: CommissionFormValues) {
  if (values.commissionType === 'percentage') {
    return {
      percentage: toPercentage(values.percentage),
    };
  }

  return {
    amountMinor: toAmountMinor(values.amount),
  };
}

function buildPaidAtForCreate(values: CommissionFormValues) {
  if (values.status !== 'paid') {
    return {};
  }

  const paidAt = toIsoDateTime(values.paidAt);

  return paidAt ? { paidAt } : {};
}

function buildPaidAtForUpdate(values: CommissionFormValues) {
  if (values.status !== 'paid') {
    return { paidAt: null };
  }

  return { paidAt: toIsoDateTime(values.paidAt) };
}

export function buildCreateCommissionRequest(
  values: CommissionFormValues,
): CreateCommissionRequest {
  const { orderId, productId } = values;

  return {
    commissionType: values.commissionType,
    contactId: values.contactId ?? '',
    currency: values.currency.trim().toUpperCase(),
    status: values.status,
    ...buildCommissionValueFields(values),
    ...buildPaidAtForCreate(values),
    ...(orderId ? { orderId } : {}),
    ...(productId ? { productId } : {}),
  };
}

export function buildUpdateCommissionRequest(
  values: CommissionFormValues,
): UpdateCommissionRequest {
  return {
    commissionType: values.commissionType,
    contactId: values.contactId ?? '',
    currency: values.currency.trim().toUpperCase(),
    orderId: values.orderId,
    productId: values.productId,
    status: values.status,
    ...buildCommissionValueFields(values),
    ...buildPaidAtForUpdate(values),
  };
}

export function cleanCommissionCurrencyFilter(value: string) {
  return cleanText(value)?.toUpperCase() ?? '';
}
