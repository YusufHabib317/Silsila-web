'use client';

import { getApiBaseUrl } from './env';
import type { ApiErrorBody, ApiErrorResponse } from './types';
import { useSessionStore } from '@/store/session';

const JSON_CONTENT_TYPE = 'application/json';
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export class ApiRequestError extends Error {
  code: string;

  requestId: string;

  status: number;

  details: unknown | undefined;

  constructor(error: ApiErrorBody, status: number) {
    super(error.message);
    this.name = 'ApiRequestError';
    this.code = error.code;
    this.requestId = error.requestId;
    this.status = status;
    this.details = error.details;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!isRecord(value) || !isRecord(value.error)) {
    return false;
  }

  const { code, message, requestId } = value.error;

  return (
    typeof code === 'string' &&
    typeof message === 'string' &&
    typeof requestId === 'string'
  );
}

function buildApiUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${getApiBaseUrl()}${normalizedPath}`;
}

async function parseError(response: Response) {
  const payload = await response.json().catch(() => null);

  if (isApiErrorResponse(payload)) {
    return new ApiRequestError(payload.error, response.status);
  }

  return new ApiRequestError(
    {
      code: 'HTTP_ERROR',
      message: response.statusText || 'Request failed',
      requestId: '',
    },
    response.status,
  );
}

export async function apiFetch<TResponse>(
  path: string,
  init: RequestInit = {},
): Promise<TResponse> {
  const method = (init.method ?? 'GET').toUpperCase();
  const headers = new Headers(init.headers);
  const { csrfToken, selectedTenantId } = useSessionStore.getState();

  headers.set('Accept', JSON_CONTENT_TYPE);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', JSON_CONTENT_TYPE);
  }

  if (selectedTenantId) {
    headers.set('x-tenant-id', selectedTenantId);
  }

  if (UNSAFE_METHODS.has(method) && csrfToken) {
    headers.set('x-csrf-token', csrfToken);
  }

  const response = await fetch(buildApiUrl(path), {
    ...init,
    method,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}
