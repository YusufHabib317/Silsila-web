'use client';

import { apiFetch } from './client';
import type {
  Contact,
  ContactRole,
  CreateContactRequest,
  Paginated,
  UpdateContactRequest,
} from './types';

export type ListContactsParams = {
  cursor?: string | null;
  limit?: number;
  role?: ContactRole;
  search?: string;
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

function buildContactsQueryString(params: ListContactsParams) {
  const searchParams = new URLSearchParams();

  setOptionalParam(searchParams, 'role', params.role);
  setOptionalParam(searchParams, 'search', params.search);

  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }

  if (params.cursor) {
    searchParams.set('cursor', params.cursor);
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

export function listContacts(params: ListContactsParams = {}) {
  return apiFetch<Paginated<Contact>>(
    `/contacts${buildContactsQueryString(params)}`,
  );
}

export function getContact(contactId: string) {
  return apiFetch<Contact>(`/contacts/${contactId}`);
}

export function createContact(body: CreateContactRequest) {
  return apiFetch<Contact>('/contacts', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateContact(contactId: string, body: UpdateContactRequest) {
  return apiFetch<Contact>(`/contacts/${contactId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
