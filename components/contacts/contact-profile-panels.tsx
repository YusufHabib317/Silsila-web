'use client';

import {
  Alert,
  Badge,
  Box,
  Button,
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
  IconMessageCircle,
  IconPhone,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { getApiErrorMessage } from '@/lib/api/errors';
import type { Contact, WhatsappMessage } from '@/lib/api/types';

import { InboxMessageRow } from '../inbox/inbox-message-row';
import { ContactRoleBadge } from './contacts-ui';

type ContactSummaryProps = {
  contact: Contact;
};

type ContactMessageListProps = {
  activeMessageId: string | null;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  messages: WhatsappMessage[];
  onLoadMore: () => void;
  onMessageSelect: (messageId: string) => void;
};

export function ContactSummary({ contact }: ContactSummaryProps) {
  const t = useTranslations('common.contacts');
  const unavailableLabel = t('contact.notAvailable');

  return (
    <Paper p="lg" radius="sm" withBorder>
      <Stack gap="md">
        <Group align="flex-start" justify="space-between" wrap="wrap">
          <Stack gap={4}>
            <Title order={2} size="h4">
              {contact.displayName}
            </Title>
            <Group c="dimmed" gap={6}>
              <IconPhone size={16} />
              <Text size="sm">
                {contact.phoneNumber ?? t('contact.noPhone')}
              </Text>
            </Group>
          </Stack>
          <Badge color="teal" radius="sm" size="lg" variant="light">
            {t('profile.contactBadge')}
          </Badge>
        </Group>

        <Group gap={6} wrap="wrap">
          {contact.roles.length > 0 ? (
            contact.roles.map((assignment) => (
              <ContactRoleBadge
                key={assignment.id}
                label={t(`role.${assignment.role}`)}
                role={assignment.role}
              />
            ))
          ) : (
            <ContactRoleBadge label={t('role.unknown')} role="unknown" />
          )}
        </Group>

        <Divider />

        <Stack gap="xs">
          <Text c="dimmed" size="xs">
            {t('detail.notes')}
          </Text>
          <Text style={{ whiteSpace: 'pre-wrap' }}>
            {contact.notes ?? unavailableLabel}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {contact.whatsappIdentities.length > 0 ? (
            contact.whatsappIdentities.map((identity) => (
              <Stack key={identity.id} gap={4}>
                <Text c="dimmed" size="xs">
                  {identity.displayName ??
                    identity.phoneNumber ??
                    unavailableLabel}
                </Text>
                <Code fz="xs">{identity.externalContactId}</Code>
              </Stack>
            ))
          ) : (
            <Text c="dimmed" size="sm">
              {t('detail.noWhatsappIdentities')}
            </Text>
          )}
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}

export function ContactMessageList({
  activeMessageId,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  messages,
  onLoadMore,
  onMessageSelect,
}: ContactMessageListProps) {
  const t = useTranslations('common.contacts');

  if (isPending) {
    return (
      <Box py="xl" ta="center">
        <Loader />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert color="red" icon={<IconAlertTriangle size={18} />}>
        {getApiErrorMessage(error)}
      </Alert>
    );
  }

  if (messages.length === 0) {
    return (
      <Alert color="gray" icon={<IconMessageCircle size={18} />}>
        {t('profile.noMessages')}
      </Alert>
    );
  }

  return (
    <Stack gap="sm">
      {messages.map((message) => (
        <InboxMessageRow
          key={message.id}
          isActive={activeMessageId === message.id}
          message={message}
          onSelect={onMessageSelect}
        />
      ))}

      {hasNextPage ? (
        <Group justify="center" pt="sm">
          <Button
            loading={isFetchingNextPage}
            onClick={onLoadMore}
            variant="light"
          >
            {t('actions.loadMore')}
          </Button>
        </Group>
      ) : null}
    </Stack>
  );
}
