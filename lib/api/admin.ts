'use client';

import { apiFetch } from './client';
import type {
  AdminAuditLog,
  AdminSystemHealth,
  AdminSystemMetrics,
  AdminTenantDetailResponse,
  AdminTenantListItem,
  AdminTenantPlan,
  AdminTenantStatus,
} from './admin-types';
import type { Paginated } from './types';

export type ListAdminTenantsParams = {
  cursor?: string | null;
  limit?: number;
  plan?: AdminTenantPlan;
  search?: string;
  status?: AdminTenantStatus;
};

export type ListAdminAuditLogsParams = {
  action?: string;
  actorUserId?: string;
  cursor?: string | null;
  entityType?: string;
  limit?: number;
  tenantId?: string;
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

function buildQueryString(
  params: ListAdminTenantsParams | ListAdminAuditLogsParams,
) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === 'limit') {
      continue;
    }

    if (typeof value === 'string' || value === null || value === undefined) {
      setOptionalParam(searchParams, key, value);
    }
  }

  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

export function listAdminTenants(params: ListAdminTenantsParams = {}) {
  return apiFetch<Paginated<AdminTenantListItem>>(
    `/admin/tenants${buildQueryString(params)}`,
  );
}

export function getAdminTenant(tenantId: string) {
  return apiFetch<AdminTenantDetailResponse>(`/admin/tenants/${tenantId}`);
}

export function listAdminAuditLogs(params: ListAdminAuditLogsParams = {}) {
  return apiFetch<Paginated<AdminAuditLog>>(
    `/admin/audit-logs${buildQueryString(params)}`,
  );
}

export function getAdminSystemMetrics() {
  return apiFetch<AdminSystemMetrics>('/admin/system-metrics');
}

export function getAdminSystemHealth() {
  return apiFetch<AdminSystemHealth>('/admin/system-health');
}
