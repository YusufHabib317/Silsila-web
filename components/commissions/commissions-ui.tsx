'use client';

import { Badge } from '@mantine/core';

import type {
  CommissionRecordType,
  CommissionStatus,
  CommissionType,
} from '@/lib/api/types';

export const COMMISSION_FILTER_ALL = 'all';

export type CommissionStatusFilter =
  | CommissionStatus
  | typeof COMMISSION_FILTER_ALL;
export type CommissionTypeFilter =
  | CommissionRecordType
  | typeof COMMISSION_FILTER_ALL;

type BadgeMeta = {
  color: string;
};

export const COMMISSION_TYPE_OPTIONS: Array<{
  labelKey: string;
  value: CommissionType;
}> = [
  { labelKey: 'type.manual', value: 'manual' },
  { labelKey: 'type.fixed_amount', value: 'fixed_amount' },
  { labelKey: 'type.percentage', value: 'percentage' },
];

export const COMMISSION_TYPE_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: CommissionTypeFilter;
}> = [
  { labelKey: 'filters.allTypes', value: COMMISSION_FILTER_ALL },
  ...COMMISSION_TYPE_OPTIONS,
  { labelKey: 'type.unknown', value: 'unknown' },
];

export const COMMISSION_STATUS_OPTIONS: Array<{
  labelKey: string;
  value: CommissionStatus;
}> = [
  { labelKey: 'status.pending', value: 'pending' },
  { labelKey: 'status.approved', value: 'approved' },
  { labelKey: 'status.paid', value: 'paid' },
  { labelKey: 'status.cancelled', value: 'cancelled' },
];

export const COMMISSION_STATUS_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: CommissionStatusFilter;
}> = [
  { labelKey: 'filters.allStatuses', value: COMMISSION_FILTER_ALL },
  ...COMMISSION_STATUS_OPTIONS,
];

const COMMISSION_STATUS_META: Record<CommissionStatus, BadgeMeta> = {
  approved: { color: 'blue' },
  cancelled: { color: 'gray' },
  paid: { color: 'green' },
  pending: { color: 'yellow' },
};

const COMMISSION_TYPE_META: Record<CommissionRecordType, BadgeMeta> = {
  fixed_amount: { color: 'teal' },
  manual: { color: 'orange' },
  percentage: { color: 'grape' },
  unknown: { color: 'gray' },
};

const COMMISSION_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
};

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

export function formatCommissionDate(
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

  return new Intl.DateTimeFormat(locale, COMMISSION_DATE_FORMAT_OPTIONS).format(
    date,
  );
}

export function formatCommissionAmount(
  amountMinor: number | null,
  currency: string,
  fallbackLabel: string,
  locale: string,
) {
  if (amountMinor === null) {
    return fallbackLabel;
  }

  const amount = amountMinor / 100;

  try {
    return new Intl.NumberFormat(locale, {
      currency,
      style: 'currency',
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${currency}`;
  }
}

export function formatCommissionValue({
  amountMinor,
  currency,
  fallbackLabel,
  locale,
  percentage,
}: {
  amountMinor: number | null;
  currency: string;
  fallbackLabel: string;
  locale: string;
  percentage: number | null;
}) {
  if (percentage !== null) {
    return `${percentage.toLocaleString(locale)}%`;
  }

  return formatCommissionAmount(amountMinor, currency, fallbackLabel, locale);
}

export function CommissionStatusBadge({
  label,
  status,
}: {
  label: string;
  status: CommissionStatus;
}) {
  const meta = COMMISSION_STATUS_META[status];

  return (
    <Badge color={meta.color} radius="sm" variant="light">
      {label}
    </Badge>
  );
}

export function CommissionTypeBadge({
  label,
  type,
}: {
  label: string;
  type: CommissionRecordType;
}) {
  const meta = COMMISSION_TYPE_META[type];

  return (
    <Badge color={meta.color} radius="sm" variant="light">
      {label}
    </Badge>
  );
}
