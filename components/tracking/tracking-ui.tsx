import { Badge } from '@mantine/core';

import type {
  TrackedSourceStatus,
  WhatsappChat,
  WhatsappSourceType,
} from '@/lib/api/types';
import {
  formatPhoneNumber,
  getWhatsappChatKind,
  jidToPhoneNumber,
  type WhatsappChatKind,
} from '@/lib/whatsapp-jid';

export type TrackingStatusFilter = TrackedSourceStatus | 'unconfigured' | 'all';
export type SourceTypeFilter = WhatsappSourceType | 'all';
export type DraftTrackingStatus = TrackedSourceStatus | null;

export const FILTER_ALL = 'all';
export const TRACKING_STATUS_UNCONFIGURED = 'unconfigured';

type StatusMeta = {
  color: string;
};

export const TRACKING_STATUS_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: TrackingStatusFilter;
}> = [
  { labelKey: 'filters.allTrackingStatuses', value: FILTER_ALL },
  { labelKey: 'filters.needsReview', value: TRACKING_STATUS_UNCONFIGURED },
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

export const CHAT_KIND_META: Record<
  WhatsappChatKind,
  { color: string; labelKey: string }
> = {
  direct: { color: 'blue', labelKey: 'chatKind.direct' },
  group: { color: 'grape', labelKey: 'chatKind.group' },
  channel: { color: 'indigo', labelKey: 'chatKind.channel' },
  broadcast: { color: 'cyan', labelKey: 'chatKind.broadcast' },
  unknown: { color: 'gray', labelKey: 'chatKind.unknown' },
};

export function getChatKind(chat: WhatsappChat): WhatsappChatKind {
  return getWhatsappChatKind(chat.externalChatId);
}

export function getChatPhoneNumber(chat: WhatsappChat): string | null {
  return formatPhoneNumber(jidToPhoneNumber(chat.externalChatId));
}

// The best human-friendly name we can derive: an explicit display name, else a
// formatted phone number (direct chats), else null so the caller can fall back
// to a chat-kind label like "Group" / "Channel".
export function getChatPrimaryName(chat: WhatsappChat): string | null {
  return chat.displayName ?? getChatPhoneNumber(chat);
}

export function getChatLabel(chat: WhatsappChat, fallbackLabel: string) {
  return getChatPrimaryName(chat) ?? chat.externalChatId ?? fallbackLabel;
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
