import { Badge } from '@mantine/core';
import dayjs from 'dayjs';

import type { WhatsappAccount, WhatsappAccountStatus } from '@/lib/api/types';

export type StatusFilter = WhatsappAccountStatus | 'all';

type StatusMeta = {
  color: string;
};

export const STATUS_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: StatusFilter;
}> = [
  { labelKey: 'filters.allStatuses', value: 'all' },
  { labelKey: 'status.pending_qr', value: 'pending_qr' },
  { labelKey: 'status.qr_ready', value: 'qr_ready' },
  { labelKey: 'status.connecting', value: 'connecting' },
  { labelKey: 'status.connected', value: 'connected' },
  { labelKey: 'status.reconnecting', value: 'reconnecting' },
  { labelKey: 'status.disconnected', value: 'disconnected' },
  { labelKey: 'status.expired', value: 'expired' },
  { labelKey: 'status.failed', value: 'failed' },
  { labelKey: 'status.disabled', value: 'disabled' },
];

export const POLLING_STATUSES = new Set<WhatsappAccountStatus>([
  'pending_qr',
  'qr_ready',
  'connecting',
  'reconnecting',
]);

const STATUS_META: Record<WhatsappAccountStatus, StatusMeta> = {
  pending_qr: { color: 'yellow' },
  qr_ready: { color: 'blue' },
  connecting: { color: 'indigo' },
  connected: { color: 'green' },
  disconnected: { color: 'gray' },
  reconnecting: { color: 'orange' },
  expired: { color: 'red' },
  failed: { color: 'red' },
  disabled: { color: 'dark' },
};

export function getAccountLabel(
  account: WhatsappAccount,
  fallbackLabel: string,
) {
  return account.displayName ?? account.phoneNumber ?? fallbackLabel;
}

export function getAccountSubtitle(account: WhatsappAccount) {
  return account.phoneNumber ?? account.id;
}

export function getStatusDescriptionKey(status: WhatsappAccountStatus) {
  return `statusDescription.${status}`;
}

export function getPrimaryActionLabelKey(status: WhatsappAccountStatus) {
  if (POLLING_STATUSES.has(status)) {
    return 'actions.viewQr';
  }

  if (status === 'connected') {
    return 'actions.viewStatus';
  }

  return 'actions.connect';
}

export function shouldConnectBeforeOpening(status: WhatsappAccountStatus) {
  return (
    status === 'disconnected' || status === 'expired' || status === 'failed'
  );
}

export function formatDate(value: string | null, fallbackLabel: string) {
  return value ? dayjs(value).format('MMM D, HH:mm') : fallbackLabel;
}

export function formatCountdown(expiresAt: string | null, now: number) {
  if (!expiresAt || now <= 0) {
    return null;
  }

  const remainingSeconds = Math.max(
    0,
    Math.ceil((Date.parse(expiresAt) - now) / 1000),
  );
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function normalizeOptionalInput(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : null;
}

export function StatusBadge({
  label,
  status,
}: {
  label: string;
  status: WhatsappAccountStatus;
}) {
  const meta = STATUS_META[status];

  return (
    <Badge color={meta.color} radius="sm" variant="light">
      {label}
    </Badge>
  );
}
