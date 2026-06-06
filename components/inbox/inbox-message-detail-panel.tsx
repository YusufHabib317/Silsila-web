'use client';

import {
  Alert,
  Box,
  Code,
  Divider,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconInfoCircle,
  IconMessageCircle,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { WhatsappMessage } from '@/lib/api/types';
import { getApiErrorMessage } from '@/lib/api/errors';

import {
  formatMessageDate,
  getMessageChatLabel,
  getMessagePreview,
  getMessageSenderLabel,
  MessageFlagBadges,
  MessageTypeBadge,
} from './inbox-ui';

type InboxMessageDetailPanelProps = {
  error: unknown;
  isPending: boolean;
  message: WhatsappMessage | null;
};

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <Stack gap={2}>
      <Text c="dimmed" size="xs">
        {label}
      </Text>
      <Text fw={600} lineClamp={2} size="sm">
        {value}
      </Text>
    </Stack>
  );
}

function DetailCodeItem({ label, value }: DetailItemProps) {
  return (
    <Stack gap={2}>
      <Text c="dimmed" size="xs">
        {label}
      </Text>
      <Code fz="xs">{value}</Code>
    </Stack>
  );
}

export function InboxMessageDetailPanel({
  error,
  isPending,
  message,
}: InboxMessageDetailPanelProps) {
  const t = useTranslations('common.inbox');
  const flagLabels = {
    archived: t('flags.archived'),
    linked: t('flags.linked'),
    personal: t('flags.personal'),
    temporary: t('flags.temporary'),
    tracked: t('flags.tracked'),
  };
  const unavailableLabel = t('message.notAvailable');

  if (!message && !isPending && !error) {
    return (
      <Paper h="100%" p="lg" radius="sm" withBorder>
        <Stack align="center" gap="sm" justify="center" mih={320}>
          <IconMessageCircle size={32} />
          <Text c="dimmed" ta="center">
            {t('detail.empty')}
          </Text>
        </Stack>
      </Paper>
    );
  }

  if (isPending) {
    return (
      <Paper h="100%" p="lg" radius="sm" withBorder>
        <Box py="xl" ta="center">
          <Loader />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper h="100%" p="lg" radius="sm" withBorder>
        <Alert color="red" icon={<IconAlertTriangle size={18} />}>
          {getApiErrorMessage(error)}
        </Alert>
      </Paper>
    );
  }

  if (!message) {
    return null;
  }

  return (
    <Paper h="100%" p="lg" radius="sm" withBorder>
      <Stack gap="lg">
        <Group align="flex-start" justify="space-between" wrap="wrap">
          <Stack gap={4}>
            <Title order={2} size="h4">
              {getMessageChatLabel(message, t('message.unknownChat'))}
            </Title>
            <Text c="dimmed" size="sm">
              {getMessageSenderLabel(
                message,
                t('message.unknownSender'),
                t('message.you'),
              )}
            </Text>
          </Stack>
          <MessageTypeBadge
            label={t(`messageType.${message.messageType}`)}
            messageType={message.messageType}
          />
        </Group>

        <MessageFlagBadges labels={flagLabels} message={message} />

        <Alert color="blue" icon={<IconInfoCircle size={18} />} variant="light">
          {t('detail.rawPayloadHidden')}
        </Alert>

        <Divider />

        <Stack gap="xs">
          <Text c="dimmed" size="xs">
            {t('detail.messageBody')}
          </Text>
          <Text style={{ whiteSpace: 'pre-wrap' }}>
            {getMessagePreview(message, t('message.noText'))}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <DetailItem
            label={t('detail.receivedAt')}
            value={formatMessageDate(message.receivedAt, t('date.never'))}
          />
          <DetailItem
            label={t('detail.expiresAt')}
            value={formatMessageDate(message.expiresAt, t('date.never'))}
          />
          <DetailItem
            label={t('detail.chatExternalId')}
            value={message.chat?.externalChatId ?? unavailableLabel}
          />
          <DetailItem
            label={t('detail.linkedContact')}
            value={message.linkedContact?.displayName ?? unavailableLabel}
          />
          <DetailItem
            label={t('detail.senderPhone')}
            value={message.sender?.phoneNumber ?? unavailableLabel}
          />
          <DetailItem
            label={t('detail.senderExternalId')}
            value={message.sender?.externalContactId ?? unavailableLabel}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <DetailCodeItem label={t('detail.messageId')} value={message.id} />
          <DetailCodeItem
            label={t('detail.externalMessageId')}
            value={message.externalMessageId}
          />
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
