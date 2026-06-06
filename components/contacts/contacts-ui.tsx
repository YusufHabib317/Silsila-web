'use client';

import { Badge } from '@mantine/core';

import type { ContactRole } from '@/lib/api/types';

export const CONTACT_FILTER_ALL = 'all';

export type ContactRoleFilter = ContactRole | typeof CONTACT_FILTER_ALL;

type BadgeMeta = {
  color: string;
};

export const CONTACT_ROLE_OPTIONS: Array<{
  labelKey: string;
  value: ContactRole;
}> = [
  { labelKey: 'role.merchant', value: 'merchant' },
  { labelKey: 'role.agent', value: 'agent' },
  { labelKey: 'role.customer', value: 'customer' },
  { labelKey: 'role.supplier', value: 'supplier' },
  { labelKey: 'role.factory', value: 'factory' },
  { labelKey: 'role.internal', value: 'internal' },
  { labelKey: 'role.unknown', value: 'unknown' },
];

export const CONTACT_ROLE_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: ContactRoleFilter;
}> = [
  { labelKey: 'filters.allRoles', value: CONTACT_FILTER_ALL },
  ...CONTACT_ROLE_OPTIONS,
];

const CONTACT_ROLE_META: Record<ContactRole, BadgeMeta> = {
  agent: { color: 'blue' },
  customer: { color: 'green' },
  factory: { color: 'grape' },
  internal: { color: 'indigo' },
  merchant: { color: 'orange' },
  supplier: { color: 'cyan' },
  unknown: { color: 'gray' },
};

const CONTACT_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
};

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

export function formatContactDate(
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

  return new Intl.DateTimeFormat(locale, CONTACT_DATE_FORMAT_OPTIONS).format(
    date,
  );
}

export function ContactRoleBadge({
  label,
  role,
}: {
  label: string;
  role: ContactRole;
}) {
  const meta = CONTACT_ROLE_META[role];

  return (
    <Badge color={meta.color} radius="sm" variant="light">
      {label}
    </Badge>
  );
}
