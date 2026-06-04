'use client';

import { Box, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconArrowUpRight, IconMessageCircle } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { WhatsappMessage } from '@/lib/api/types';

import {
  formatMessageDate,
  getMessageChatLabel,
  getMessagePreview,
  getMessageSenderLabel,
  MessageFlagBadges,
  MessageTypeBadge,
} from './inbox-ui';

type InboxMessageRowProps = {
  isActive: boolean;
  message: WhatsappMessage;
  onSelect: (messageId: string) => void;
};

export function InboxMessageRow({
  isActive,
  message,
  onSelect,
}: InboxMessageRowProps) {
  const t = useTranslations('common.inbox');
  const flagLabels = {
    archived: t('flags.archived'),
    linked: t('flags.linked'),
    personal: t('flags.personal'),
    temporary: t('flags.temporary'),
    tracked: t('flags.tracked'),
  };

  return (
    <UnstyledButton
      onClick={() => onSelect(message.id)}
      style={(theme) => ({
        background: isActive ? theme.colors.blue[0] : theme.white,
        border: `1px solid ${isActive ? theme.colors.blue[4] : theme.colors.gray[3]}`,
        borderRadius: theme.radius.sm,
        display: 'block',
        padding: theme.spacing.md,
        width: '100%',
      })}
    >
      <Stack gap="sm">
        <Group align="flex-start" justify="space-between" wrap="nowrap">
          <Group gap="xs" miw={0} wrap="nowrap">
            {message.isFromMe ? (
              <IconArrowUpRight size={16} />
            ) : (
              <IconMessageCircle size={16} />
            )}
            <Stack gap={1} miw={0}>
              <Text fw={700} lineClamp={1} size="sm">
                {getMessageChatLabel(message, t('message.unknownChat'))}
              </Text>
              <Text c="dimmed" lineClamp={1} size="xs">
                {getMessageSenderLabel(
                  message,
                  t('message.unknownSender'),
                  t('message.you'),
                )}
              </Text>
            </Stack>
          </Group>
          <Text c="dimmed" size="xs" ta="end">
            {formatMessageDate(message.receivedAt, t('date.never'))}
          </Text>
        </Group>

        <Text lineClamp={2} size="sm">
          {getMessagePreview(message, t('message.noText'))}
        </Text>

        <Group justify="space-between" wrap="wrap">
          <MessageTypeBadge
            label={t(`messageType.${message.messageType}`)}
            messageType={message.messageType}
          />
          <Box>
            <MessageFlagBadges labels={flagLabels} message={message} />
          </Box>
        </Group>
      </Stack>
    </UnstyledButton>
  );
}
