'use client';

import type { InfiniteData } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconListCheck } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import {
  listWhatsappAccounts,
  listWhatsappChats,
  type ListWhatsappChatsParams,
  updateTrackedSource,
} from '@/lib/api/whatsapp';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ensureCsrfToken } from '@/lib/api/session-token';
import type {
  Paginated,
  TrackedSourceStatus,
  WhatsappChat,
  WhatsappSourceType,
} from '@/lib/api/types';
import { useSessionStore } from '@/store/session';

import { TrackingChatListPanel } from './tracking-chat-list-panel';
import {
  FILTER_ALL,
  type SourceTypeFilter,
  type TrackingStatusFilter,
} from './tracking-ui';

const CHAT_PAGE_LIMIT = 50;
const ACCOUNT_FILTER_LIMIT = 100;

type UpdateTrackedSourceVariables = {
  chatId: string;
  sourceType: WhatsappSourceType;
  status: TrackedSourceStatus;
};

function buildChatsParams({
  accountFilter,
  cursor,
  search,
  sourceTypeFilter,
  trackingStatusFilter,
}: {
  accountFilter: string;
  cursor: string | null;
  search: string;
  sourceTypeFilter: SourceTypeFilter;
  trackingStatusFilter: TrackingStatusFilter;
}): ListWhatsappChatsParams {
  const params: ListWhatsappChatsParams = {
    cursor,
    limit: CHAT_PAGE_LIMIT,
  };

  if (accountFilter !== FILTER_ALL) {
    params.whatsappAccountId = accountFilter;
  }

  if (sourceTypeFilter !== FILTER_ALL) {
    params.sourceType = sourceTypeFilter;
  }

  if (trackingStatusFilter !== FILTER_ALL) {
    params.trackingStatus = trackingStatusFilter;
  }

  if (search) {
    params.search = search;
  }

  return params;
}

export function TrackingSettings() {
  const t = useTranslations('common.tracking');
  const queryClient = useQueryClient();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const [accountFilter, setAccountFilter] = useState<string>(FILTER_ALL);
  const [search, setSearch] = useState('');
  const [sourceTypeFilter, setSourceTypeFilter] =
    useState<SourceTypeFilter>(FILTER_ALL);
  const [trackingStatusFilter, setTrackingStatusFilter] =
    useState<TrackingStatusFilter>(FILTER_ALL);
  const [debouncedSearch] = useDebouncedValue(search.trim(), 350);

  const accountsQuery = useQuery({
    enabled: Boolean(selectedTenantId),
    queryFn: () => listWhatsappAccounts({ limit: ACCOUNT_FILTER_LIMIT }),
    queryKey: ['whatsappAccounts', selectedTenantId, 'trackingFilters'],
  });

  const chatsQuery = useInfiniteQuery<
    Paginated<WhatsappChat>,
    Error,
    InfiniteData<Paginated<WhatsappChat>>,
    [
      'whatsappChats',
      string | null,
      string,
      SourceTypeFilter,
      TrackingStatusFilter,
      string,
    ],
    string | null
  >({
    enabled: Boolean(selectedTenantId),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      listWhatsappChats(
        buildChatsParams({
          accountFilter,
          cursor: pageParam,
          search: debouncedSearch,
          sourceTypeFilter,
          trackingStatusFilter,
        }),
      ),
    queryKey: [
      'whatsappChats',
      selectedTenantId,
      accountFilter,
      sourceTypeFilter,
      trackingStatusFilter,
      debouncedSearch,
    ],
  });

  const chats = useMemo(
    () => chatsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [chatsQuery.data],
  );
  const accounts = accountsQuery.data?.items ?? [];

  const updateMutation = useMutation({
    mutationFn: async ({
      chatId,
      sourceType,
      status,
    }: UpdateTrackedSourceVariables) => {
      await ensureCsrfToken();

      return updateTrackedSource(chatId, { sourceType, status });
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('notifications.updateFailed'),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['whatsappChats'] });
      void queryClient.invalidateQueries({ queryKey: ['whatsappMessages'] });
      notifications.show({
        color: 'green',
        message: t('notifications.updateSuccessMessage'),
        title: t('notifications.updateSuccessTitle'),
      });
    },
  });

  function handleSave(
    chatId: string,
    status: TrackedSourceStatus,
    sourceType: WhatsappSourceType,
  ) {
    updateMutation.mutate({ chatId, sourceType, status });
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
            <ThemeIcon color="teal" radius="sm" variant="light">
              <IconListCheck size={18} />
            </ThemeIcon>
            <Title order={1} size="h2">
              {t('page.title')}
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            {t('page.subtitle')}
          </Text>
        </Stack>
        <Badge color="teal" radius="sm" size="lg" variant="light">
          {t('page.receiveOnly')}
        </Badge>
      </Group>

      <TrackingChatListPanel
        accountFilter={accountFilter}
        accounts={accounts}
        chats={chats}
        error={chatsQuery.error ?? accountsQuery.error}
        hasNextPage={Boolean(chatsQuery.hasNextPage)}
        isFetchingNextPage={chatsQuery.isFetchingNextPage}
        isPending={chatsQuery.isPending || accountsQuery.isPending}
        isRefetching={chatsQuery.isRefetching || accountsQuery.isRefetching}
        onAccountFilterChange={setAccountFilter}
        onLoadMore={() => void chatsQuery.fetchNextPage()}
        onRefresh={() => {
          void accountsQuery.refetch();
          void chatsQuery.refetch();
        }}
        onSave={handleSave}
        onSearchChange={setSearch}
        onSourceTypeFilterChange={setSourceTypeFilter}
        onTrackingStatusFilterChange={setTrackingStatusFilter}
        savingChatId={updateMutation.variables?.chatId ?? null}
        search={search}
        sourceTypeFilter={sourceTypeFilter}
        trackingStatusFilter={trackingStatusFilter}
      />
    </Stack>
  );
}
