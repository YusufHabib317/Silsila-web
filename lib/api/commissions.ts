'use client';

import { apiFetch } from './client';
import type {
  Commission,
  CommissionRecordType,
  CommissionStatus,
  CreateCommissionRequest,
  Paginated,
  UpdateCommissionRequest,
} from './types';

export type ListCommissionsParams = {
  commissionType?: CommissionRecordType;
  contactId?: string;
  currency?: string;
  cursor?: string | null;
  limit?: number;
  orderId?: string;
  productId?: string;
  status?: CommissionStatus;
};

function setOptionalParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | null | undefined,
) {
  const trimmedValue = value?.trim();

  if (trimmedValue) {
    searchParams.set(key, trimmedValue);
  }
}

function buildCommissionsQueryString(params: ListCommissionsParams) {
  const searchParams = new URLSearchParams();

  setOptionalParam(searchParams, 'orderId', params.orderId);
  setOptionalParam(searchParams, 'productId', params.productId);
  setOptionalParam(searchParams, 'contactId', params.contactId);
  setOptionalParam(searchParams, 'commissionType', params.commissionType);
  setOptionalParam(searchParams, 'status', params.status);
  setOptionalParam(searchParams, 'currency', params.currency);

  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }

  if (params.cursor) {
    searchParams.set('cursor', params.cursor);
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

export function listCommissions(params: ListCommissionsParams = {}) {
  return apiFetch<Paginated<Commission>>(
    `/commissions${buildCommissionsQueryString(params)}`,
  );
}

export function getCommission(commissionId: string) {
  return apiFetch<Commission>(`/commissions/${commissionId}`);
}

export function createCommission(body: CreateCommissionRequest) {
  return apiFetch<Commission>('/commissions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateCommission(
  commissionId: string,
  body: UpdateCommissionRequest,
) {
  return apiFetch<Commission>(`/commissions/${commissionId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
