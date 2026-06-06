'use client';

import { Badge, Box, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import {
  IconArrowUpRight,
  IconMessageCircle,
  IconPhone,
  IconUser,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { WhatsappMessage } from '@/lib/api/types';

import {
  formatMessageDate,
  getMessageChatLabel,
  getMessagePreview,
  getMessageSenderName,
  getMessageSenderPhone,
  isGroupMessage,
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
  const isGroup = isGroupMessage(message);
  const chatLabel = getMessageChatLabel(message, t('message.unknownChat'));
  const senderName = getMessageSenderName(
    message,
    t('message.unknownSender'),
    t('message.you'),
  );
  const senderPhone = getMessageSenderPhone(message);

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
            {isGroup ? (
              <IconUsersGroup size={16} />
            ) : message.isFromMe ? (
              <IconArrowUpRight size={16} />
            ) : (
              <IconMessageCircle size={16} />
            )}
            <Stack gap={2} miw={0}>
              <Group gap={6} miw={0} wrap="nowrap">
                <Text fw={700} lineClamp={1} size="sm">
                  {chatLabel}
                </Text>
                {isGroup ? (
                  <Badge color="grape" radius="sm" size="xs" variant="light">
                    {t('message.group')}
                  </Badge>
                ) : null}
              </Group>
              <Group c="dimmed" gap={4} miw={0} wrap="nowrap">
                <IconUser size={13} />
                <Text lineClamp={1} size="xs">
                  {senderName}
                </Text>
              </Group>
              {senderPhone && senderPhone !== senderName ? (
                <Group c="dimmed" gap={4} miw={0} wrap="nowrap">
                  <IconPhone size={13} />
                  <Text lineClamp={1} size="xs">
                    {senderPhone}
                  </Text>
                </Group>
              ) : null}
            </Stack>
          </Group>
          <Text c="dimmed" size="xs" ta="end">
            {formatMessageDate(message.receivedAt, t('date.never'))}
          </Text>
        </Group>

        <Text lineClamp={2} size="sm" style={{ whiteSpace: 'pre-wrap' }}>
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
