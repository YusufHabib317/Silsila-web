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
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconBrandWhatsapp,
  IconRefresh,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { WhatsappAccount } from '@/lib/api/types';
import { getApiErrorMessage } from '@/lib/api/errors';

import {
  formatDate,
  getAccountLabel,
  getAccountSubtitle,
  STATUS_FILTER_OPTIONS,
  StatusBadge,
  type StatusFilter,
} from './whatsapp-ui';
import { WhatsappAccountActions } from './whatsapp-account-actions';

const WHATSAPP_TRANSLATIONS = 'common.whatsapp';

type WhatsappAccountListPanelProps = {
  accounts: WhatsappAccount[];
  connectingAccountId: string | null;
  disconnectingAccountId: string | null;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  isRefetching: boolean;
  onDisconnect: (account: WhatsappAccount) => void;
  onLoadMore: () => void;
  onPrimaryAction: (account: WhatsappAccount) => void;
  onRefresh: () => void;
  onStatusFilterChange: (statusFilter: StatusFilter) => void;
  statusFilter: StatusFilter;
};

function AccountRows({
  accounts,
  connectingAccountId,
  disconnectingAccountId,
  onDisconnect,
  onPrimaryAction,
}: Pick<
  WhatsappAccountListPanelProps,
  | 'accounts'
  | 'connectingAccountId'
  | 'disconnectingAccountId'
  | 'onDisconnect'
  | 'onPrimaryAction'
>) {
  const t = useTranslations(WHATSAPP_TRANSLATIONS);
  const neverLabel = t('date.never');

  return (
    <Table.Tbody>
      {accounts.map((account) => (
        <Table.Tr key={account.id}>
          <Table.Td>
            <Stack gap={2}>
              <Text fw={700}>
                {getAccountLabel(account, t('account.unnamed'))}
              </Text>
              <Text c="dimmed" size="xs">
                {getAccountSubtitle(account)}
              </Text>
            </Stack>
          </Table.Td>
          <Table.Td>
            <StatusBadge
              label={t(`status.${account.status}`)}
              status={account.status}
            />
          </Table.Td>
          <Table.Td>
            <Stack gap={2}>
              <Text size="sm">
                {t('table.connected')}:{' '}
                {formatDate(account.lastConnectedAt, neverLabel)}
              </Text>
              <Text c="dimmed" size="xs">
                {t('table.updated')}:{' '}
                {formatDate(account.updatedAt, neverLabel)}
              </Text>
            </Stack>
          </Table.Td>
          <Table.Td>
            <WhatsappAccountActions
              account={account}
              isConnecting={connectingAccountId === account.id}
              isDisconnecting={disconnectingAccountId === account.id}
              onDisconnect={onDisconnect}
              onPrimaryAction={onPrimaryAction}
            />
          </Table.Td>
        </Table.Tr>
      ))}
    </Table.Tbody>
  );
}

function AccountListContent({
  accounts,
  connectingAccountId,
  disconnectingAccountId,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  onDisconnect,
  onLoadMore,
  onPrimaryAction,
}: Omit<
  WhatsappAccountListPanelProps,
  'isRefetching' | 'onRefresh' | 'onStatusFilterChange' | 'statusFilter'
>) {
  const t = useTranslations(WHATSAPP_TRANSLATIONS);

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

  if (accounts.length === 0) {
    return (
      <Alert color="gray" icon={<IconBrandWhatsapp size={18} />}>
        {t('empty.noAccounts')}
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Table.ScrollContainer minWidth={760}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('table.account')}</Table.Th>
              <Table.Th>{t('table.status')}</Table.Th>
              <Table.Th>{t('table.lastActivity')}</Table.Th>
              <Table.Th ta="right">{t('table.actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <AccountRows
            accounts={accounts}
            connectingAccountId={connectingAccountId}
            disconnectingAccountId={disconnectingAccountId}
            onDisconnect={onDisconnect}
            onPrimaryAction={onPrimaryAction}
          />
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

export function WhatsappAccountListPanel({
  accounts,
  connectingAccountId,
  disconnectingAccountId,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  isRefetching,
  onDisconnect,
  onLoadMore,
  onPrimaryAction,
  onRefresh,
  onStatusFilterChange,
  statusFilter,
}: WhatsappAccountListPanelProps) {
  const t = useTranslations(WHATSAPP_TRANSLATIONS);
  const statusOptions = useMemo(
    () =>
      STATUS_FILTER_OPTIONS.map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      })),
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
              {t('list.loaded', { count: accounts.length })}
            </Text>
          </Stack>
          <Group gap="sm">
            <Select
              allowDeselect={false}
              data={statusOptions}
              onChange={(value) =>
                onStatusFilterChange((value as StatusFilter | null) ?? 'all')
              }
              value={statusFilter}
              w={180}
            />
            <Button
              leftSection={<IconRefresh size={18} />}
              loading={isRefetching}
              onClick={onRefresh}
              variant="light"
            >
              {t('actions.refresh')}
            </Button>
          </Group>
        </Group>

        <AccountListContent
          accounts={accounts}
          connectingAccountId={connectingAccountId}
          disconnectingAccountId={disconnectingAccountId}
          error={error}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isPending={isPending}
          onDisconnect={onDisconnect}
          onLoadMore={onLoadMore}
          onPrimaryAction={onPrimaryAction}
        />
      </Stack>
    </Paper>
  );
}
