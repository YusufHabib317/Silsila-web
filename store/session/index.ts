'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type {
  AuthResponse,
  AuthUser,
  MeResponse,
  TenantMembership,
} from '@/lib/api/types';

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'anonymous'
  | 'error';

type SessionState = {
  csrfToken: string | null;
  errorMessage: string | null;
  isPlatformAdmin: boolean;
  selectedTenantId: string | null;
  status: AuthStatus;
  tenants: TenantMembership[];
  user: AuthUser | null;
};

type SessionActions = {
  clearAuth: () => void;
  selectTenant: (tenantId: string) => void;
  setAuth: (response: AuthResponse | MeResponse) => void;
  setCsrfToken: (csrfToken: string | null) => void;
  setError: (message: string) => void;
  setStatus: (status: AuthStatus) => void;
};

type SessionStore = SessionState & SessionActions;

const initialState: SessionState = {
  csrfToken: null,
  errorMessage: null,
  isPlatformAdmin: false,
  selectedTenantId: null,
  status: 'idle',
  tenants: [],
  user: null,
};

function resolveTenantId(
  tenants: TenantMembership[],
  currentTenantId: string | null,
) {
  const hasCurrentTenant = tenants.some(
    (tenant) => tenant.id === currentTenantId,
  );

  if (currentTenantId && hasCurrentTenant) {
    return currentTenantId;
  }

  return tenants.length === 1 ? (tenants[0]?.id ?? null) : null;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      clearAuth: () =>
        set({
          ...initialState,
          status: 'anonymous',
        }),
      selectTenant: (tenantId) => set({ selectedTenantId: tenantId }),
      setAuth: (response) =>
        set((state) => ({
          csrfToken:
            'csrfToken' in response ? response.csrfToken : state.csrfToken,
          errorMessage: null,
          isPlatformAdmin: response.isPlatformAdmin,
          selectedTenantId: resolveTenantId(
            response.tenants,
            get().selectedTenantId,
          ),
          status: 'authenticated',
          tenants: response.tenants,
          user: response.user,
        })),
      setCsrfToken: (csrfToken) => set({ csrfToken }),
      setError: (message) => set({ errorMessage: message, status: 'error' }),
      setStatus: (status) => set({ status }),
    }),
    {
      name: 'wa-commerce-session',
      partialize: (state) => ({
        csrfToken: state.csrfToken,
        selectedTenantId: state.selectedTenantId,
      }),
    },
  ),
);
