import { Badge } from '@mantine/core';

import type {
  TrackedSourceStatus,
  WhatsappChat,
  WhatsappSourceType,
} from '@/lib/api/types';

export type TrackingStatusFilter = TrackedSourceStatus | 'all';
export type SourceTypeFilter = WhatsappSourceType | 'all';
export type DraftTrackingStatus = TrackedSourceStatus | null;

export const FILTER_ALL = 'all';

type StatusMeta = {
  color: string;
};

export const TRACKING_STATUS_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: TrackingStatusFilter;
}> = [
  { labelKey: 'filters.allTrackingStatuses', value: FILTER_ALL },
  { labelKey: 'status.tracked', value: 'tracked' },
  { labelKey: 'status.ignored', value: 'ignored' },
  { labelKey: 'status.personal', value: 'personal' },
];

export const TRACKING_STATUS_EDITOR_OPTIONS: Array<{
  labelKey: string;
  value: TrackedSourceStatus;
}> = [
  { labelKey: 'status.tracked', value: 'tracked' },
  { labelKey: 'status.ignored', value: 'ignored' },
  { labelKey: 'status.personal', value: 'personal' },
];

export const SOURCE_TYPE_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: SourceTypeFilter;
}> = [
  { labelKey: 'filters.allSourceTypes', value: FILTER_ALL },
  { labelKey: 'sourceType.merchant_group', value: 'merchant_group' },
  { labelKey: 'sourceType.agent_group', value: 'agent_group' },
  { labelKey: 'sourceType.customer_chat', value: 'customer_chat' },
  { labelKey: 'sourceType.supplier_chat', value: 'supplier_chat' },
  { labelKey: 'sourceType.internal_team', value: 'internal_team' },
  { labelKey: 'sourceType.unknown', value: 'unknown' },
];

export const SOURCE_TYPE_EDITOR_OPTIONS = SOURCE_TYPE_FILTER_OPTIONS.filter(
  (option) => option.value !== FILTER_ALL,
) as Array<{ labelKey: string; value: WhatsappSourceType }>;

const TRACKING_STATUS_META: Record<TrackedSourceStatus, StatusMeta> = {
  tracked: { color: 'green' },
  ignored: { color: 'gray' },
  personal: { color: 'yellow' },
};

export function getChatLabel(chat: WhatsappChat, fallbackLabel: string) {
  return chat.displayName ?? chat.externalChatId ?? fallbackLabel;
}

export function getChatSourceType(chat: WhatsappChat) {
  return chat.tracking?.sourceType ?? chat.sourceType;
}

export function hasTrackingDraftChanged(
  chat: WhatsappChat,
  status: DraftTrackingStatus,
  sourceType: WhatsappSourceType,
) {
  const currentStatus = chat.tracking?.status ?? null;
  const currentSourceType = getChatSourceType(chat);

  return status !== currentStatus || sourceType !== currentSourceType;
}

export function TrackingStatusBadge({
  label,
  status,
}: {
  label: string;
  status: DraftTrackingStatus;
}) {
  if (!status) {
    return (
      <Badge color="dark" radius="sm" variant="outline">
        {label}
      </Badge>
    );
  }

  const meta = TRACKING_STATUS_META[status];

  return (
    <Badge color={meta.color} radius="sm" variant="light">
      {label}
    </Badge>
  );
}
