import { Badge, Group } from '@mantine/core';
import dayjs from 'dayjs';

import type { WhatsappMessage, WhatsappMessageType } from '@/lib/api/types';
import type { BooleanQueryValue } from '@/lib/api/whatsapp';
import {
  getWhatsappChatKind,
  jidToPhoneNumber,
  stripJidDomain,
} from '@/lib/whatsapp-jid';

export type BooleanFilter = BooleanQueryValue | 'all';
export type MessageTypeFilter = WhatsappMessageType | 'all';

export const INBOX_FILTER_ALL = 'all';

type BadgeMeta = {
  color: string;
};

export const MESSAGE_TYPE_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: MessageTypeFilter;
}> = [
  { labelKey: 'filters.allMessageTypes', value: INBOX_FILTER_ALL },
  { labelKey: 'messageType.text', value: 'text' },
  { labelKey: 'messageType.image', value: 'image' },
  { labelKey: 'messageType.video', value: 'video' },
  { labelKey: 'messageType.audio', value: 'audio' },
  { labelKey: 'messageType.voice', value: 'voice' },
  { labelKey: 'messageType.document', value: 'document' },
  { labelKey: 'messageType.sticker', value: 'sticker' },
  { labelKey: 'messageType.location', value: 'location' },
  { labelKey: 'messageType.contact', value: 'contact' },
  { labelKey: 'messageType.unknown', value: 'unknown' },
];

const MESSAGE_TYPE_META: Record<WhatsappMessageType, BadgeMeta> = {
  text: { color: 'blue' },
  image: { color: 'grape' },
  video: { color: 'violet' },
  audio: { color: 'indigo' },
  voice: { color: 'cyan' },
  document: { color: 'orange' },
  sticker: { color: 'pink' },
  location: { color: 'teal' },
  contact: { color: 'green' },
  unknown: { color: 'gray' },
};

export function isGroupMessage(message: WhatsappMessage): boolean {
  return getWhatsappChatKind(message.chat?.externalChatId) === 'group';
}

export function getMessageChatLabel(
  message: WhatsappMessage,
  fallbackLabel: string,
) {
  return (
    message.chat?.displayName ??
    stripJidDomain(message.chat?.externalChatId) ??
    fallbackLabel
  );
}

export function getMessageSenderPhone(message: WhatsappMessage): string | null {
  if (message.isFromMe) {
    return null;
  }

  return (
    message.linkedContact?.phoneNumber ??
    message.sender?.phoneNumber ??
    jidToPhoneNumber(message.sender?.externalContactId)
  );
}

export function getMessageSenderName(
  message: WhatsappMessage,
  fallbackLabel: string,
  selfLabel: string,
) {
  if (message.isFromMe) {
    return selfLabel;
  }

  return (
    message.linkedContact?.displayName ??
    message.sender?.displayName ??
    getMessageSenderPhone(message) ??
    stripJidDomain(message.sender?.externalContactId) ??
    fallbackLabel
  );
}

export function getMessagePreview(
  message: WhatsappMessage,
  fallbackLabel: string,
) {
  const bodyText = message.bodyText?.trim();

  return bodyText || fallbackLabel;
}

export function formatMessageDate(value: string, fallbackLabel: string) {
  return value ? dayjs(value).format('MMM D, HH:mm') : fallbackLabel;
}

export function getBooleanParam(value: BooleanFilter) {
  return value === INBOX_FILTER_ALL ? undefined : value;
}

export function MessageTypeBadge({
  label,
  messageType,
}: {
  label: string;
  messageType: WhatsappMessageType;
}) {
  const meta = MESSAGE_TYPE_META[messageType];

  return (
    <Badge color={meta.color} radius="sm" variant="light">
      {label}
    </Badge>
  );
}

export function MessageFlagBadges({
  labels,
  message,
}: {
  labels: {
    archived: string;
    linked: string;
    personal: string;
    temporary: string;
    tracked: string;
  };
  message: WhatsappMessage;
}) {
  return (
    <Group gap={6}>
      {message.isTracked ? (
        <Badge color="green" radius="sm">
          {labels.tracked}
        </Badge>
      ) : null}
      {message.isLinked ? (
        <Badge color="blue" radius="sm">
          {labels.linked}
        </Badge>
      ) : null}
      {message.isPersonal ? (
        <Badge color="yellow" radius="sm">
          {labels.personal}
        </Badge>
      ) : null}
      {message.isTemporary ? (
        <Badge color="orange" radius="sm">
          {labels.temporary}
        </Badge>
      ) : null}
      {message.isArchived ? (
        <Badge color="gray" radius="sm">
          {labels.archived}
        </Badge>
      ) : null}
    </Group>
  );
}
