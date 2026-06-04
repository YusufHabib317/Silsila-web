'use client';

import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconAlertTriangle, IconInbox, IconRefresh } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { getApiErrorMessage } from '@/lib/api/errors';
import type {
  WhatsappAccount,
  WhatsappChat,
  WhatsappMessage,
} from '@/lib/api/types';

import { InboxMessageFilters } from './inbox-message-filters';
import { InboxMessageRow } from './inbox-message-row';
import { type BooleanFilter, type MessageTypeFilter } from './inbox-ui';

type InboxMessageListPanelProps = {
  accountFilter: string;
  accounts: WhatsappAccount[];
  activeMessageId: string | null;
  archivedFilter: BooleanFilter;
  chatFilter: string;
  chats: WhatsappChat[];
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  isRefetching: boolean;
  linkedFilter: BooleanFilter;
  messageTypeFilter: MessageTypeFilter;
  messages: WhatsappMessage[];
  onAccountFilterChange: (accountId: string) => void;
  onArchivedFilterChange: (value: BooleanFilter) => void;
  onChatFilterChange: (chatId: string) => void;
  onLinkedFilterChange: (value: BooleanFilter) => void;
  onLoadMore: () => void;
  onMessageSelect: (messageId: string) => void;
  onMessageTypeFilterChange: (value: MessageTypeFilter) => void;
  onPersonalFilterChange: (value: BooleanFilter) => void;
  onRefresh: () => void;
  onSearchChange: (search: string) => void;
  onTrackedFilterChange: (value: BooleanFilter) => void;
  personalFilter: BooleanFilter;
  search: string;
  trackedFilter: BooleanFilter;
};

function MessageListContent({
  activeMessageId,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  messages,
  onLoadMore,
  onMessageSelect,
}: Pick<
  InboxMessageListPanelProps,
  | 'activeMessageId'
  | 'error'
  | 'hasNextPage'
  | 'isFetchingNextPage'
  | 'isPending'
  | 'messages'
  | 'onLoadMore'
  | 'onMessageSelect'
>) {
  const t = useTranslations('common.inbox');

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
      <Alert color="gray" icon={<IconInbox size={18} />}>
        {t('empty.noMessages')}
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

export function InboxMessageListPanel({
  accountFilter,
  accounts,
  activeMessageId,
  archivedFilter,
  chatFilter,
  chats,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  isRefetching,
  linkedFilter,
  messageTypeFilter,
  messages,
  onAccountFilterChange,
  onArchivedFilterChange,
  onChatFilterChange,
  onLinkedFilterChange,
  onLoadMore,
  onMessageSelect,
  onMessageTypeFilterChange,
  onPersonalFilterChange,
  onRefresh,
  onSearchChange,
  onTrackedFilterChange,
  personalFilter,
  search,
  trackedFilter,
}: InboxMessageListPanelProps) {
  const t = useTranslations('common.inbox');

  return (
    <Paper p="lg" radius="sm" withBorder>
      <Stack gap="md">
        <Group justify="space-between" wrap="wrap">
          <Stack gap={2}>
            <Title order={2} size="h4">
              {t('list.title')}
            </Title>
            <Text c="dimmed" size="sm">
              {t('list.loaded', { count: messages.length })}
            </Text>
          </Stack>
          <Button
            leftSection={<IconRefresh size={18} />}
            loading={isRefetching}
            onClick={onRefresh}
            variant="light"
          >
            {t('actions.refresh')}
          </Button>
        </Group>

        <InboxMessageFilters
          accountFilter={accountFilter}
          accounts={accounts}
          archivedFilter={archivedFilter}
          chatFilter={chatFilter}
          chats={chats}
          linkedFilter={linkedFilter}
          messageTypeFilter={messageTypeFilter}
          onAccountFilterChange={onAccountFilterChange}
          onArchivedFilterChange={onArchivedFilterChange}
          onChatFilterChange={onChatFilterChange}
          onLinkedFilterChange={onLinkedFilterChange}
          onMessageTypeFilterChange={onMessageTypeFilterChange}
          onPersonalFilterChange={onPersonalFilterChange}
          onSearchChange={onSearchChange}
          onTrackedFilterChange={onTrackedFilterChange}
          personalFilter={personalFilter}
          search={search}
          trackedFilter={trackedFilter}
        />

        <MessageListContent
          activeMessageId={activeMessageId}
          error={error}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isPending={isPending}
          messages={messages}
          onLoadMore={onLoadMore}
          onMessageSelect={onMessageSelect}
        />
      </Stack>
    </Paper>
  );
}
