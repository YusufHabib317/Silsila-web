'use client';

import { Badge } from '@mantine/core';

import type { AdminTenantPlan, AdminTenantStatus } from '@/lib/api/admin-types';

export const ADMIN_FILTER_ALL = 'all';

export type AdminTenantStatusFilter =
  | AdminTenantStatus
  | typeof ADMIN_FILTER_ALL;

export type AdminTenantPlanFilter = AdminTenantPlan | typeof ADMIN_FILTER_ALL;

type BadgeMeta = {
  color: string;
};

export const ADMIN_TENANT_STATUS_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: AdminTenantStatusFilter;
}> = [
  { labelKey: 'filters.allStatuses', value: ADMIN_FILTER_ALL },
  { labelKey: 'tenantStatus.active', value: 'active' },
  { labelKey: 'tenantStatus.trial', value: 'trial' },
  { labelKey: 'tenantStatus.disabled', value: 'disabled' },
  { labelKey: 'tenantStatus.deleted', value: 'deleted' },
];

export const ADMIN_TENANT_PLAN_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: AdminTenantPlanFilter;
}> = [
  { labelKey: 'filters.allPlans', value: ADMIN_FILTER_ALL },
  { labelKey: 'tenantPlan.free', value: 'free' },
  { labelKey: 'tenantPlan.starter', value: 'starter' },
  { labelKey: 'tenantPlan.pro', value: 'pro' },
  { labelKey: 'tenantPlan.enterprise', value: 'enterprise' },
];

const TENANT_STATUS_META: Record<AdminTenantStatus, BadgeMeta> = {
  active: { color: 'green' },
  deleted: { color: 'gray' },
  disabled: { color: 'red' },
  trial: { color: 'blue' },
};

const TENANT_PLAN_META: Record<AdminTenantPlan, BadgeMeta> = {
  enterprise: { color: 'grape' },
  free: { color: 'gray' },
  pro: { color: 'indigo' },
  starter: { color: 'teal' },
};

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
};

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

function getStatusColor(
  value: string,
  meta: Partial<Record<string, BadgeMeta>>,
) {
  return meta[value]?.color ?? 'gray';
}

export function formatAdminDate(
  value: string | null,
  fallbackLabel: string,
  locale: string,
) {
  if (!value) {
    return fallbackLabel;
  }

  const date = new Date(value);

  if (!isValidDate(date)) {
    return fallbackLabel;
  }

  return new Intl.DateTimeFormat(locale, DATE_FORMAT_OPTIONS).format(date);
}

export function formatAdminNumber(value: number, locale: string) {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatStorageBytes(value: number, locale: string) {
  if (value <= 0) {
    return `0 ${unitLabel('byte', 0)}`;
  }

  const units = ['byte', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(
    Math.floor(Math.log(value) / Math.log(1024)),
    units.length - 1,
  );
  const amount = value / 1024 ** exponent;

  return `${new Intl.NumberFormat(locale, {
    maximumFractionDigits: exponent === 0 ? 0 : 1,
  }).format(amount)} ${unitLabel(units[exponent] ?? 'byte', amount)}`;
}

function unitLabel(unit: string, amount: number) {
  if (unit !== 'byte') {
    return unit;
  }

  return amount === 1 ? 'byte' : 'bytes';
}

export function shortId(value: string | null, fallbackLabel: string) {
  if (!value) {
    return fallbackLabel;
  }

  return value.length > 12 ? `${value.slice(0, 8)}...` : value;
}

export function stringifyMetadata(metadata: Record<string, unknown>) {
  const keys = Object.keys(metadata);

  if (keys.length === 0) {
    return '{}';
  }

  return JSON.stringify(metadata);
}

export function TenantStatusBadge({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <Badge
      color={getStatusColor(status, TENANT_STATUS_META)}
      radius="sm"
      variant="light"
    >
      {label}
    </Badge>
  );
}

export function TenantPlanBadge({
  label,
  plan,
}: {
  label: string;
  plan: string;
}) {
  return (
    <Badge
      color={getStatusColor(plan, TENANT_PLAN_META)}
      radius="sm"
      variant="outline"
    >
      {label}
    </Badge>
  );
}

export function GenericStatusBadge({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  return (
    <Badge
      color={status === 'ok' ? 'green' : 'gray'}
      radius="sm"
      variant="light"
    >
      {label}
    </Badge>
  );
}
