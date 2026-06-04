'use client';

import { useSessionStore } from '@/store/session';

import { getCsrf } from './auth';

export async function ensureCsrfToken() {
  const existingToken = useSessionStore.getState().csrfToken;

  if (existingToken) {
    return existingToken;
  }

  const { csrfToken } = await getCsrf();
  useSessionStore.getState().setCsrfToken(csrfToken);

  return csrfToken;
}
