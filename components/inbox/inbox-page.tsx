'use client';

import type { InfiniteData } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Grid,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconAlertTriangle, IconInbox } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import {
  getWhatsappMessage,
  listWhatsappAccounts,
  listWhatsappChats,
  listWhatsappMessages,
  type ListWhatsappMessagesParams,
} from '@/lib/api/whatsapp';
import type { Paginated, WhatsappMessage } from '@/lib/api/types';
import { useSessionStore } from '@/store/session';

import { InboxMessageDetailPanel } from './inbox-message-detail-panel';
import { InboxMessageListPanel } from './inbox-message-list-panel';
import {
  type BooleanFilter,
  getBooleanParam,
  INBOX_FILTER_ALL,
  type MessageTypeFilter,
} from './inbox-ui';

const MESSAGE_PAGE_LIMIT = 50;
const FILTER_PAGE_LIMIT = 100;

type InboxFilters = {
  accountFilter: string;
  archivedFilter: BooleanFilter;
  chatFilter: string;
  linkedFilter: BooleanFilter;
  messageTypeFilter: MessageTypeFilter;
  personalFilter: BooleanFilter;
  search: string;
  trackedFilter: BooleanFilter;
};

function buildMessageParams(
  filters: InboxFilters,
  cursor: string | null,
): ListWhatsappMessagesParams {
  const params: ListWhatsappMessagesParams = {
    cursor,
    limit: MESSAGE_PAGE_LIMIT,
  };
  const isArchived = getBooleanParam(filters.archivedFilter);
  const isLinked = getBooleanParam(filters.linkedFilter);
  const isPersonal = getBooleanParam(filters.personalFilter);
  const isTracked = getBooleanParam(filters.trackedFilter);

  if (isArchived) {
    params.isArchived = isArchived;
  }

  if (isLinked) {
    params.isLinked = isLinked;
  }

  if (isPersonal) {
    params.isPersonal = isPersonal;
  }

  if (isTracked) {
    params.isTracked = isTracked;
  }

  if (filters.accountFilter !== INBOX_FILTER_ALL) {
    params.whatsappAccountId = filters.accountFilter;
  }

  if (filters.chatFilter !== INBOX_FILTER_ALL) {
    params.chatId = filters.chatFilter;
  }

  if (filters.messageTypeFilter !== INBOX_FILTER_ALL) {
    params.messageType = filters.messageTypeFilter;
  }

  if (filters.search) {
    params.search = filters.search;
  }

  return params;
}

export function InboxPage() {
  const t = useTranslations('common.inbox');
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const [accountFilter, setAccountFilter] = useState(INBOX_FILTER_ALL);
  const [archivedFilter, setArchivedFilter] =
    useState<BooleanFilter>(INBOX_FILTER_ALL);
  const [chatFilter, setChatFilter] = useState(INBOX_FILTER_ALL);
  const [linkedFilter, setLinkedFilter] =
    useState<BooleanFilter>(INBOX_FILTER_ALL);
  const [messageTypeFilter, setMessageTypeFilter] =
    useState<MessageTypeFilter>(INBOX_FILTER_ALL);
  const [personalFilter, setPersonalFilter] =
    useState<BooleanFilter>(INBOX_FILTER_ALL);
  const [search, setSearch] = useState('');
  const [trackedFilter, setTrackedFilter] =
    useState<BooleanFilter>(INBOX_FILTER_ALL);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [debouncedSearch] = useDebouncedValue(search.trim(), 350);

  const accountsQuery = useQuery({
    enabled: Boolean(selectedTenantId),
    queryFn: () => listWhatsappAccounts({ limit: FILTER_PAGE_LIMIT }),
    queryKey: ['whatsappAccounts', selectedTenantId, 'inboxFilters'],
  });
  const chatsQuery = useQuery({
    enabled: Boolean(selectedTenantId),
    queryFn: () => {
      const params = { limit: FILTER_PAGE_LIMIT };

      return listWhatsappChats(
        accountFilter === INBOX_FILTER_ALL
          ? params
          : { ...params, whatsappAccountId: accountFilter },
      );
    },
    queryKey: [
      'whatsappChats',
      selectedTenantId,
      'inboxFilters',
      accountFilter,
    ],
  });
  const filters: InboxFilters = {
    accountFilter,
    archivedFilter,
    chatFilter,
    linkedFilter,
    messageTypeFilter,
    personalFilter,
    search: debouncedSearch,
    trackedFilter,
  };
  const messagesQuery = useInfiniteQuery<
    Paginated<WhatsappMessage>,
    Error,
    InfiniteData<Paginated<WhatsappMessage>>,
    ['whatsappMessages', string | null, InboxFilters],
    string | null
  >({
    enabled: Boolean(selectedTenantId),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      listWhatsappMessages(buildMessageParams(filters, pageParam)),
    queryKey: ['whatsappMessages', selectedTenantId, filters],
  });
  const detailQuery = useQuery({
    enabled: Boolean(activeMessageId),
    queryFn: () => {
      if (!activeMessageId) {
        throw new Error(t('errors.messageIdMissing'));
      }

      return getWhatsappMessage(activeMessageId);
    },
    queryKey: ['whatsappMessage', selectedTenantId, activeMessageId],
  });

  const messages = useMemo(
    () => messagesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [messagesQuery.data],
  );

  function handleAccountFilterChange(accountId: string) {
    setAccountFilter(accountId);
    setChatFilter(INBOX_FILTER_ALL);
  }

  if (!selectedTenantId) {
    return (
      <Alert color="yellow" icon={<IconAlertTriangle size={18} />}>
        {t('empty.selectTenant')}
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      <Group align="flex-start" justify="space-between">
        <Stack gap={4}>
          <Group gap="sm">
            <ThemeIcon color="blue" radius="sm" variant="light">
              <IconInbox size={18} />
            </ThemeIcon>
            <Title order={1} size="h2">
              {t('page.title')}
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            {t('page.subtitle')}
          </Text>
        </Stack>
        <Badge color="blue" radius="sm" size="lg" variant="light">
          {t('page.noReplyActions')}
        </Badge>
      </Group>

      <Grid align="stretch">
        <Grid.Col span={{ base: 12, xl: 7 }}>
          <InboxMessageListPanel
            accountFilter={accountFilter}
            accounts={accountsQuery.data?.items ?? []}
            activeMessageId={activeMessageId}
            archivedFilter={archivedFilter}
            chatFilter={chatFilter}
            chats={chatsQuery.data?.items ?? []}
            error={
              messagesQuery.error ?? accountsQuery.error ?? chatsQuery.error
            }
            hasNextPage={Boolean(messagesQuery.hasNextPage)}
            isFetchingNextPage={messagesQuery.isFetchingNextPage}
            isPending={
              messagesQuery.isPending ||
              accountsQuery.isPending ||
              chatsQuery.isPending
            }
            isRefetching={
              messagesQuery.isRefetching ||
              accountsQuery.isRefetching ||
              chatsQuery.isRefetching
            }
            linkedFilter={linkedFilter}
            messageTypeFilter={messageTypeFilter}
            messages={messages}
            onAccountFilterChange={handleAccountFilterChange}
            onArchivedFilterChange={setArchivedFilter}
            onChatFilterChange={setChatFilter}
            onLinkedFilterChange={setLinkedFilter}
            onLoadMore={() => void messagesQuery.fetchNextPage()}
            onMessageSelect={setActiveMessageId}
            onMessageTypeFilterChange={setMessageTypeFilter}
            onPersonalFilterChange={setPersonalFilter}
            onRefresh={() => {
              void accountsQuery.refetch();
              void chatsQuery.refetch();
              void messagesQuery.refetch();
            }}
            onSearchChange={setSearch}
            onTrackedFilterChange={setTrackedFilter}
            personalFilter={personalFilter}
            search={search}
            trackedFilter={trackedFilter}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, xl: 5 }}>
          <InboxMessageDetailPanel
            error={detailQuery.error}
            isPending={detailQuery.isPending && Boolean(activeMessageId)}
            message={detailQuery.data ?? null}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
