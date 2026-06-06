'use client';

import { apiFetch } from './client';
import type {
  CreateWhatsappAccountRequest,
  Paginated,
  TrackedSourceStatus,
  UpdateTrackedSourceRequest,
  WhatsappAccount,
  WhatsappAccountDetail,
  WhatsappAccountStatus,
  WhatsappChat,
  WhatsappMessage,
  WhatsappMessageType,
  WhatsappSourceType,
} from './types';

export type BooleanQueryValue = 'true' | 'false';

export type ListWhatsappAccountsParams = {
  cursor?: string | null;
  limit?: number;
  status?: WhatsappAccountStatus;
};

export type ListWhatsappChatsParams = {
  cursor?: string | null;
  limit?: number;
  search?: string;
  sourceType?: WhatsappSourceType;
  // 'unconfigured' is a filter-only sentinel for chats with no tracking row yet.
  trackingStatus?: TrackedSourceStatus | 'unconfigured';
  whatsappAccountId?: string;
};

export type ListWhatsappMessagesParams = {
  chatId?: string;
  contactId?: string;
  cursor?: string | null;
  isArchived?: BooleanQueryValue;
  isLinked?: BooleanQueryValue;
  isPersonal?: BooleanQueryValue;
  isTracked?: BooleanQueryValue;
  limit?: number;
  messageType?: WhatsappMessageType;
  search?: string;
  senderContactId?: string;
  whatsappAccountId?: string;
};

function buildAccountQueryString(params: ListWhatsappAccountsParams) {
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

function buildChatQueryString(params: ListWhatsappChatsParams) {
  const searchParams = new URLSearchParams();

  if (params.whatsappAccountId) {
    searchParams.set('whatsappAccountId', params.whatsappAccountId);
  }

  if (params.sourceType) {
    searchParams.set('sourceType', params.sourceType);
  }

  if (params.trackingStatus) {
    searchParams.set('trackingStatus', params.trackingStatus);
  }

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
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

function setBooleanParam(
  searchParams: URLSearchParams,
  key: string,
  value: BooleanQueryValue | undefined,
) {
  if (value) {
    searchParams.set(key, value);
  }
}

function buildMessageQueryString(params: ListWhatsappMessagesParams) {
  const searchParams = new URLSearchParams();

  if (params.whatsappAccountId) {
    searchParams.set('whatsappAccountId', params.whatsappAccountId);
  }

  if (params.chatId) {
    searchParams.set('chatId', params.chatId);
  }

  if (params.contactId) {
    searchParams.set('contactId', params.contactId);
  }

  if (params.senderContactId) {
    searchParams.set('senderContactId', params.senderContactId);
  }

  if (params.messageType) {
    searchParams.set('messageType', params.messageType);
  }

  setBooleanParam(searchParams, 'isTracked', params.isTracked);
  setBooleanParam(searchParams, 'isLinked', params.isLinked);
  setBooleanParam(searchParams, 'isArchived', params.isArchived);
  setBooleanParam(searchParams, 'isPersonal', params.isPersonal);

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
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
    `/whatsapp/accounts${buildAccountQueryString(params)}`,
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

export function listWhatsappChats(params: ListWhatsappChatsParams = {}) {
  return apiFetch<Paginated<WhatsappChat>>(
    `/whatsapp/chats${buildChatQueryString(params)}`,
  );
}

export function updateTrackedSource(
  chatId: string,
  body: UpdateTrackedSourceRequest,
) {
  return apiFetch<WhatsappChat>(`/tracked-sources/${chatId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export function listWhatsappMessages(params: ListWhatsappMessagesParams = {}) {
  return apiFetch<Paginated<WhatsappMessage>>(
    `/whatsapp/messages${buildMessageQueryString(params)}`,
  );
}

export function getWhatsappMessage(messageId: string) {
  return apiFetch<WhatsappMessage>(`/whatsapp/messages/${messageId}`);
}
