'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getMe } from '@/lib/api/auth';
import { ApiRequestError } from '@/lib/api/client';
import { getApiErrorMessage } from '@/lib/api/errors';
import { useSessionStore } from '@/store/session';

export function useSessionBootstrap() {
  const clearAuth = useSessionStore((state) => state.clearAuth);
  const setAuth = useSessionStore((state) => state.setAuth);
  const setError = useSessionStore((state) => state.setError);
  const setStatus = useSessionStore((state) => state.setStatus);

  const query = useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.isPending) {
      setStatus('loading');
    }
  }, [query.isPending, setStatus]);

  useEffect(() => {
    if (query.data) {
      setAuth(query.data);
    }
  }, [query.data, setAuth]);

  useEffect(() => {
    if (!query.error) {
      return;
    }

    if (query.error instanceof ApiRequestError && query.error.status === 401) {
      clearAuth();
      return;
    }

    setError(getApiErrorMessage(query.error));
  }, [clearAuth, query.error, setError]);

  return query;
}
