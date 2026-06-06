'use client';

import type { InfiniteData } from '@tanstack/react-query';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
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
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconBrandWhatsapp } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import QRCode from 'qrcode';
import { useMemo, useState } from 'react';

import {
  connectWhatsappAccount,
  createWhatsappAccount,
  disconnectWhatsappAccount,
  getWhatsappAccount,
  listWhatsappAccounts,
} from '@/lib/api/whatsapp';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ensureCsrfToken } from '@/lib/api/session-token';
import type {
  CreateWhatsappAccountRequest,
  Paginated,
  WhatsappAccount,
} from '@/lib/api/types';
import { useSessionStore } from '@/store/session';

import {
  type CreateAccountValues,
  WhatsappAccountCreatePanel,
} from './whatsapp-account-create-panel';
import { WhatsappAccountListPanel } from './whatsapp-account-list-panel';
import { WhatsappConnectionModal } from './whatsapp-connection-modal';
import { WhatsappDisconnectModal } from './whatsapp-disconnect-modal';
import {
  normalizeOptionalInput,
  POLLING_STATUSES,
  shouldConnectBeforeOpening,
  type StatusFilter,
} from './whatsapp-ui';

const ACCOUNT_PAGE_LIMIT = 50;
const ACCOUNT_DETAIL_REFETCH_INTERVAL = 5 * 60 * 1_000;

export function WhatsappSettings() {
  const t = useTranslations('common.whatsapp');
  const queryClient = useQueryClient();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] =
    useState<WhatsappAccount | null>(null);
  const [accountFormResetSignal, setAccountFormResetSignal] = useState(0);

  const accountsQuery = useInfiniteQuery<
    Paginated<WhatsappAccount>,
    Error,
    InfiniteData<Paginated<WhatsappAccount>>,
    ['whatsappAccounts', string | null, StatusFilter],
    string | null
  >({
    enabled: Boolean(selectedTenantId),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      listWhatsappAccounts({
        cursor: pageParam,
        limit: ACCOUNT_PAGE_LIMIT,
        ...(statusFilter === 'all' ? {} : { status: statusFilter }),
      }),
    queryKey: ['whatsappAccounts', selectedTenantId, statusFilter],
  });

  const accounts = useMemo(
    () => accountsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [accountsQuery.data],
  );

  const activeAccountFromList =
    accounts.find((account) => account.id === activeAccountId) ?? null;

  const accountDetailQuery = useQuery({
    enabled: Boolean(activeAccountId),
    queryFn: () => {
      if (!activeAccountId) {
        throw new Error(t('errors.accountIdMissing'));
      }

      return getWhatsappAccount(activeAccountId);
    },
    queryKey: ['whatsappAccount', selectedTenantId, activeAccountId],
    refetchInterval: (query) => {
      const account = query.state.data;

      return account && !POLLING_STATUSES.has(account.status)
        ? false
        : ACCOUNT_DETAIL_REFETCH_INTERVAL;
    },
  });

  const qrCode = accountDetailQuery.data?.qrAvailable
    ? accountDetailQuery.data.qrCode
    : null;

  const qrDataUrlQuery = useQuery({
    enabled: Boolean(qrCode),
    queryFn: () =>
      QRCode.toDataURL(qrCode ?? '', {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 260,
      }),
    queryKey: ['whatsappQrDataUrl', qrCode],
  });

  function openConnectionModal(accountId: string) {
    setActiveAccountId(accountId);
  }

  const createMutation = useMutation({
    mutationFn: async (body: CreateWhatsappAccountRequest) => {
      await ensureCsrfToken();

      return createWhatsappAccount(body);
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('notifications.createFailed'),
      });
    },
    onSuccess: (account) => {
      setAccountFormResetSignal((signal) => signal + 1);
      openConnectionModal(account.id);
      void queryClient.invalidateQueries({ queryKey: ['whatsappAccounts'] });
      notifications.show({
        color: 'green',
        message: t('notifications.createSuccessMessage'),
        title: t('notifications.createSuccessTitle'),
      });
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (accountId: string) => {
      await ensureCsrfToken();

      return connectWhatsappAccount(accountId);
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('notifications.connectFailed'),
      });
    },
    onSuccess: (account) => {
      openConnectionModal(account.id);
      void queryClient.invalidateQueries({ queryKey: ['whatsappAccounts'] });
      void queryClient.invalidateQueries({
        queryKey: ['whatsappAccount', selectedTenantId, account.id],
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (accountId: string) => {
      await ensureCsrfToken();

      return disconnectWhatsappAccount(accountId);
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('notifications.disconnectFailed'),
      });
    },
    onSuccess: (account) => {
      setDisconnectTarget(null);
      void queryClient.invalidateQueries({ queryKey: ['whatsappAccounts'] });
      void queryClient.invalidateQueries({
        queryKey: ['whatsappAccount', selectedTenantId, account.id],
      });
      notifications.show({
        color: 'green',
        message: t('notifications.disconnectSuccessMessage'),
        title: t('notifications.disconnectSuccessTitle'),
      });
    },
  });

  function closeConnectionModal() {
    setActiveAccountId(null);
  }

  function handleCreateAccount(values: CreateAccountValues) {
    createMutation.mutate({
      displayName: normalizeOptionalInput(values.displayName),
      phoneNumber: normalizeOptionalInput(values.phoneNumber),
    });
  }

  function handlePrimaryAction(account: WhatsappAccount) {
    if (shouldConnectBeforeOpening(account.status)) {
      connectMutation.mutate(account.id);
      return;
    }

    openConnectionModal(account.id);
  }

  function handleConfirmDisconnect() {
    if (disconnectTarget) {
      disconnectMutation.mutate(disconnectTarget.id);
    }
  }

  const connectingAccountId = connectMutation.isPending
    ? (connectMutation.variables ?? null)
    : null;
  const disconnectingAccountId = disconnectMutation.isPending
    ? (disconnectMutation.variables ?? null)
    : null;

  if (!selectedTenantId) {
    return (
      <Alert color="yellow" icon={<IconAlertTriangle size={18} />}>
        {t('empty.selectTenant')}
      </Alert>
    );
  }

  return (
    <>
      <Stack gap="xl">
        <Group align="flex-start" justify="space-between">
          <Stack gap={4}>
            <Group gap="sm">
              <ThemeIcon color="green" radius="sm" variant="light">
                <IconBrandWhatsapp size={18} />
              </ThemeIcon>
              <Title order={1} size="h2">
                {t('page.title')}
              </Title>
            </Group>
            <Text c="dimmed" size="sm">
              {t('page.subtitle')}
            </Text>
          </Stack>
          <Badge color="green" radius="sm" size="lg" variant="light">
            {t('page.noAutomatedSending')}
          </Badge>
        </Group>

        <Grid align="flex-start">
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <WhatsappAccountCreatePanel
              key={accountFormResetSignal}
              isSubmitting={createMutation.isPending}
              onSubmit={handleCreateAccount}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 8 }}>
            <WhatsappAccountListPanel
              accounts={accounts}
              connectingAccountId={connectingAccountId}
              disconnectingAccountId={disconnectingAccountId}
              error={accountsQuery.error}
              hasNextPage={Boolean(accountsQuery.hasNextPage)}
              isFetchingNextPage={accountsQuery.isFetchingNextPage}
              isPending={accountsQuery.isPending}
              isRefetching={accountsQuery.isRefetching}
              onDisconnect={setDisconnectTarget}
              onLoadMore={() => void accountsQuery.fetchNextPage()}
              onPrimaryAction={handlePrimaryAction}
              onRefresh={() => void accountsQuery.refetch()}
              onStatusFilterChange={setStatusFilter}
              statusFilter={statusFilter}
            />
          </Grid.Col>
        </Grid>
      </Stack>

      <WhatsappConnectionModal
        account={accountDetailQuery.data ?? null}
        error={accountDetailQuery.error}
        fallbackAccount={activeAccountFromList}
        isFetching={accountDetailQuery.isFetching}
        isPending={accountDetailQuery.isPending}
        onClose={closeConnectionModal}
        onDisconnect={setDisconnectTarget}
        onRefresh={() => void accountDetailQuery.refetch()}
        opened={Boolean(activeAccountId)}
        qrDataUrl={qrDataUrlQuery.data ?? null}
        qrError={
          qrDataUrlQuery.error ? getApiErrorMessage(qrDataUrlQuery.error) : null
        }
      />

      <WhatsappDisconnectModal
        isPending={disconnectMutation.isPending}
        onCancel={() => setDisconnectTarget(null)}
        onConfirm={handleConfirmDisconnect}
        target={disconnectTarget}
      />
    </>
  );
}
