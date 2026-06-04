'use client';

import { apiFetch } from './client';
import type {
  AuthResponse,
  CsrfResponse,
  LoginRequest,
  MeResponse,
  RegisterRequest,
} from './types';

export function getCsrf() {
  return apiFetch<CsrfResponse>('/auth/csrf');
}

export function login(body: LoginRequest) {
  return apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function register(body: RegisterRequest) {
  return apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function logout() {
  return apiFetch<void>('/auth/logout', { method: 'POST' });
}

export function getMe() {
  return apiFetch<MeResponse>('/me');
}
