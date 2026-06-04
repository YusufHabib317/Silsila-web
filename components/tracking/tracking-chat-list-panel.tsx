'use client';

import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconMessageCircle,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type {
  TrackedSourceStatus,
  WhatsappAccount,
  WhatsappChat,
  WhatsappSourceType,
} from '@/lib/api/types';
import { getApiErrorMessage } from '@/lib/api/errors';
import { getAccountLabel } from '@/components/whatsapp/whatsapp-ui';

import { TrackingChatRow } from './tracking-chat-row';
import {
  FILTER_ALL,
  type SourceTypeFilter,
  SOURCE_TYPE_FILTER_OPTIONS,
  TRACKING_STATUS_FILTER_OPTIONS,
  type TrackingStatusFilter,
} from './tracking-ui';

type TrackingChatListPanelProps = {
  accountFilter: string;
  accounts: WhatsappAccount[];
  chats: WhatsappChat[];
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  isRefetching: boolean;
  onAccountFilterChange: (accountId: string) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  onSave: (
    chatId: string,
    status: TrackedSourceStatus,
    sourceType: WhatsappSourceType,
  ) => void;
  onSearchChange: (search: string) => void;
  onSourceTypeFilterChange: (sourceType: SourceTypeFilter) => void;
  onTrackingStatusFilterChange: (status: TrackingStatusFilter) => void;
  savingChatId: string | null;
  search: string;
  sourceTypeFilter: SourceTypeFilter;
  trackingStatusFilter: TrackingStatusFilter;
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

function ChatListContent({
  accountLabels,
  chats,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  onLoadMore,
  onSave,
  savingChatId,
}: Pick<
  TrackingChatListPanelProps,
  | 'chats'
  | 'error'
  | 'hasNextPage'
  | 'isFetchingNextPage'
  | 'isPending'
  | 'onLoadMore'
  | 'onSave'
  | 'savingChatId'
> & {
  accountLabels: Map<string, string>;
}) {
  const t = useTranslations('common.tracking');

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

  if (chats.length === 0) {
    return (
      <Alert color="gray" icon={<IconMessageCircle size={18} />}>
        {t('empty.noChats')}
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Table.ScrollContainer minWidth={980}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('table.chat')}</Table.Th>
              <Table.Th>{t('table.account')}</Table.Th>
              <Table.Th>{t('table.tracking')}</Table.Th>
              <Table.Th>{t('table.sourceType')}</Table.Th>
              <Table.Th>{t('table.updated')}</Table.Th>
              <Table.Th ta="right">{t('table.actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {chats.map((chat) => (
              <TrackingChatRow
                key={`${chat.id}-${chat.tracking?.status ?? 'new'}-${chat.tracking?.sourceType ?? chat.sourceType}`}
                accountLabel={
                  accountLabels.get(chat.whatsappAccountId) ??
                  chat.whatsappAccountId
                }
                chat={chat}
                isSaving={savingChatId === chat.id}
                onSave={onSave}
              />
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {hasNextPage ? (
        <Group justify="center">
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

export function TrackingChatListPanel({
  accountFilter,
  accounts,
  chats,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  isRefetching,
  onAccountFilterChange,
  onLoadMore,
  onRefresh,
  onSave,
  onSearchChange,
  onSourceTypeFilterChange,
  onTrackingStatusFilterChange,
  savingChatId,
  search,
  sourceTypeFilter,
  trackingStatusFilter,
}: TrackingChatListPanelProps) {
  const t = useTranslations('common.tracking');
  const accountLabels = useMemo(() => {
    const labels = new Map<string, string>();

    for (const account of accounts) {
      labels.set(account.id, getAccountLabel(account, t('account.unnamed')));
    }

    return labels;
  }, [accounts, t]);
  const accountOptions = useMemo(
    () => [
      { label: t('filters.allAccounts'), value: FILTER_ALL },
      ...accounts.map((account) => ({
        label: getAccountLabel(account, t('account.unnamed')),
        value: account.id,
      })),
    ],
    [accounts, t],
  );
  const sourceTypeOptions = useMemo(
    () => buildSelectData(SOURCE_TYPE_FILTER_OPTIONS, t),
    [t],
  );
  const trackingStatusOptions = useMemo(
    () => buildSelectData(TRACKING_STATUS_FILTER_OPTIONS, t),
    [t],
  );

  return (
    <Paper p="lg" radius="sm" withBorder>
      <Stack gap="md">
        <Group justify="space-between" wrap="wrap">
          <Stack gap={2}>
            <Title order={2} size="h4">
              {t('list.title')}
            </Title>
            <Text c="dimmed" size="sm">
              {t('list.loaded', { count: chats.length })}
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

        <Group align="flex-end" gap="sm" wrap="wrap">
          <Select
            allowDeselect={false}
            data={accountOptions}
            label={t('filters.account')}
            onChange={(value) => onAccountFilterChange(value ?? FILTER_ALL)}
            value={accountFilter}
            w={210}
          />
          <Select
            allowDeselect={false}
            data={trackingStatusOptions}
            label={t('filters.trackingStatus')}
            onChange={(value) =>
              onTrackingStatusFilterChange(
                (value as TrackingStatusFilter | null) ?? FILTER_ALL,
              )
            }
            value={trackingStatusFilter}
            w={190}
          />
          <Select
            allowDeselect={false}
            data={sourceTypeOptions}
            label={t('filters.sourceType')}
            onChange={(value) =>
              onSourceTypeFilterChange(
                (value as SourceTypeFilter | null) ?? FILTER_ALL,
              )
            }
            value={sourceTypeFilter}
            w={210}
          />
          <TextInput
            label={t('filters.search')}
            leftSection={<IconSearch size={16} />}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            placeholder={t('filters.searchPlaceholder')}
            value={search}
            w={260}
          />
        </Group>

        <ChatListContent
          accountLabels={accountLabels}
          chats={chats}
          error={error}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isPending={isPending}
          onLoadMore={onLoadMore}
          onSave={onSave}
          savingChatId={savingChatId}
        />
      </Stack>
    </Paper>
  );
}
