'use client';

import { Button, Group, Select, Stack, Table, Text } from '@mantine/core';
import { IconDeviceMobile, IconDeviceFloppy } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import type {
  TrackedSourceStatus,
  WhatsappChat,
  WhatsappSourceType,
} from '@/lib/api/types';

import {
  type DraftTrackingStatus,
  getChatLabel,
  getChatSourceType,
  hasTrackingDraftChanged,
  SOURCE_TYPE_EDITOR_OPTIONS,
  TRACKING_STATUS_EDITOR_OPTIONS,
  TrackingStatusBadge,
} from './tracking-ui';
import { formatDate } from '@/components/whatsapp/whatsapp-ui';

type TrackingChatRowProps = {
  accountLabel: string;
  chat: WhatsappChat;
  isSaving: boolean;
  onSave: (
    chatId: string,
    status: TrackedSourceStatus,
    sourceType: WhatsappSourceType,
  ) => void;
};

function buildSelectData(
  options: Array<{ labelKey: string; value: string }>,
  translate: (key: string) => string,
) {
  return options.map((option) => ({
    label: translate(option.labelKey),
    value: option.value,
  }));
}

export function TrackingChatRow({
  accountLabel,
  chat,
  isSaving,
  onSave,
}: TrackingChatRowProps) {
  const t = useTranslations('common.tracking');
  const neverLabel = t('date.never');
  const [status, setStatus] = useState<DraftTrackingStatus>(
    chat.tracking?.status ?? null,
  );
  const [sourceType, setSourceType] = useState<WhatsappSourceType>(
    getChatSourceType(chat),
  );
  const statusOptions = useMemo(
    () => buildSelectData(TRACKING_STATUS_EDITOR_OPTIONS, t),
    [t],
  );
  const sourceOptions = useMemo(
    () => buildSelectData(SOURCE_TYPE_EDITOR_OPTIONS, t),
    [t],
  );
  const hasChanges = hasTrackingDraftChanged(chat, status, sourceType);
  const canSave = Boolean(status) && hasChanges && !isSaving;

  function handleStatusChange(value: string | null) {
    setStatus(value as DraftTrackingStatus);
  }

  function handleSourceChange(value: string | null) {
    setSourceType((value as WhatsappSourceType | null) ?? 'unknown');
  }

  function handleSave() {
    if (status) {
      onSave(chat.id, status, sourceType);
    }
  }

  return (
    <Table.Tr>
      <Table.Td>
        <Stack gap={2}>
          <Text fw={700}>{getChatLabel(chat, t('chat.unnamed'))}</Text>
          <Text c="dimmed" size="xs">
            {chat.externalChatId}
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <IconDeviceMobile size={16} />
          <Text lineClamp={1} size="sm">
            {accountLabel}
          </Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Stack gap="xs">
          <TrackingStatusBadge
            label={status ? t(`status.${status}`) : t('status.unconfigured')}
            status={status}
          />
          <Select
            aria-label={t('editor.status')}
            data={statusOptions}
            onChange={handleStatusChange}
            placeholder={t('editor.statusPlaceholder')}
            value={status}
            w={160}
          />
        </Stack>
      </Table.Td>
      <Table.Td>
        <Select
          aria-label={t('editor.sourceType')}
          data={sourceOptions}
          onChange={handleSourceChange}
          value={sourceType}
          w={190}
        />
      </Table.Td>
      <Table.Td>
        <Stack gap={2}>
          <Text size="sm">{formatDate(chat.updatedAt, neverLabel)}</Text>
          <Text c="dimmed" size="xs">
            {t('table.created')}: {formatDate(chat.createdAt, neverLabel)}
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Group justify="flex-end">
          <Button
            disabled={!canSave}
            leftSection={<IconDeviceFloppy size={16} />}
            loading={isSaving}
            onClick={handleSave}
            size="xs"
          >
            {t('actions.save')}
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
