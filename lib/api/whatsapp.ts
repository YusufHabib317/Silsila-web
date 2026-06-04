'use client';

import { apiFetch } from './client';
import type {
  CreateWhatsappAccountRequest,
  Paginated,
  WhatsappAccount,
  WhatsappAccountDetail,
  WhatsappAccountStatus,
} from './types';

export type ListWhatsappAccountsParams = {
  cursor?: string | null;
  limit?: number;
  status?: WhatsappAccountStatus;
};

function buildQueryString(params: ListWhatsappAccountsParams) {
  const searchParams = new URLSearchParams();

  if (params.status) {
    searchParams.set('status', params.status);
  }

  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }

  if (params.cursor) {
    searchParams.set('cursor', params.cursor);
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

export function listWhatsappAccounts(params: ListWhatsappAccountsParams = {}) {
  return apiFetch<Paginated<WhatsappAccount>>(
    `/whatsapp/accounts${buildQueryString(params)}`,
  );
}

export function createWhatsappAccount(body: CreateWhatsappAccountRequest) {
  return apiFetch<WhatsappAccountDetail>('/whatsapp/accounts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getWhatsappAccount(accountId: string) {
  return apiFetch<WhatsappAccountDetail>(`/whatsapp/accounts/${accountId}`);
}

export function connectWhatsappAccount(accountId: string) {
  return apiFetch<WhatsappAccountDetail>(
    `/whatsapp/accounts/${accountId}/connect`,
    { method: 'POST' },
  );
}

export function disconnectWhatsappAccount(accountId: string) {
  return apiFetch<WhatsappAccountDetail>(
    `/whatsapp/accounts/${accountId}/disconnect`,
    { method: 'POST' },
  );
}
