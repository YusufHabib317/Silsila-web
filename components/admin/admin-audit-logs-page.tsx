'use client';

import type { InfiniteData } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconHistory,
  IconRefresh,
} from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import {
  listAdminAuditLogs,
  type ListAdminAuditLogsParams,
} from '@/lib/api/admin';
import { getApiErrorMessage } from '@/lib/api/errors';
import type { AdminAuditLog } from '@/lib/api/admin-types';
import type { Paginated } from '@/lib/api/types';

import { AdminAccessGuard } from './admin-access-guard';
import { AdminPageHeader } from './admin-page-header';
import { formatAdminDate, shortId, stringifyMetadata } from './admin-ui';

const AUDIT_LOG_PAGE_LIMIT = 50;
const ADMIN_TRANSLATIONS = 'common.admin';

type AuditLogFilters = {
  action: string;
  actorUserId: string;
  entityType: string;
  tenantId: string;
};

function buildAuditLogParams(filters: AuditLogFilters, cursor: string | null) {
  const params: ListAdminAuditLogsParams = {
    cursor,
    limit: AUDIT_LOG_PAGE_LIMIT,
  };

  if (filters.tenantId) {
    params.tenantId = filters.tenantId;
  }

  if (filters.actorUserId) {
    params.actorUserId = filters.actorUserId;
  }

  if (filters.action) {
    params.action = filters.action;
  }

  if (filters.entityType) {
    params.entityType = filters.entityType;
  }

  return params;
}

function AuditLogsTableContent({
  auditLogs,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  onLoadMore,
}: {
  auditLogs: AdminAuditLog[];
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  onLoadMore: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations(ADMIN_TRANSLATIONS);
  const notAvailableLabel = t('auditLogs.notAvailable');

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

  if (auditLogs.length === 0) {
    return (
      <Alert color="gray" icon={<IconHistory size={18} />}>
        {t('empty.noAuditLogs')}
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Table.ScrollContainer minWidth={1120}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('auditLogs.table.event')}</Table.Th>
              <Table.Th>{t('auditLogs.table.actor')}</Table.Th>
              <Table.Th>{t('auditLogs.table.tenant')}</Table.Th>
              <Table.Th>{t('auditLogs.table.entity')}</Table.Th>
              <Table.Th>{t('auditLogs.table.metadata')}</Table.Th>
              <Table.Th>{t('auditLogs.table.created')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {auditLogs.map((auditLog) => (
              <Table.Tr key={auditLog.id}>
                <Table.Td>
                  <Stack gap={2}>
                    <Text fw={700}>{auditLog.action}</Text>
                    <Text c="dimmed" size="xs">
                      {shortId(auditLog.id, notAvailableLabel)}
                    </Text>
                  </Stack>
                </Table.Td>
                <Table.Td>
                  {shortId(auditLog.actorUserId, t('auditLogs.systemActor'))}
                </Table.Td>
                <Table.Td>
                  {shortId(auditLog.tenantId, notAvailableLabel)}
                </Table.Td>
                <Table.Td>
                  <Stack gap={2}>
                    <Text size="sm">{auditLog.entityType}</Text>
                    <Text c="dimmed" lineClamp={1} size="xs">
                      {shortId(auditLog.entityId, notAvailableLabel)}
                    </Text>
                  </Stack>
                </Table.Td>
                <Table.Td maw={320}>
                  <Text c="dimmed" ff="monospace" lineClamp={2} size="xs">
                    {stringifyMetadata(auditLog.metadata)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  {formatAdminDate(auditLog.createdAt, t('date.never'), locale)}
                </Table.Td>
              </Table.Tr>
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

function AdminAuditLogsContent() {
  const t = useTranslations(ADMIN_TRANSLATIONS);
  const [action, setAction] = useState('');
  const [actorUserId, setActorUserId] = useState('');
  const [entityType, setEntityType] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [debouncedAction] = useDebouncedValue(action.trim(), 350);
  const [debouncedActorUserId] = useDebouncedValue(actorUserId.trim(), 350);
  const [debouncedEntityType] = useDebouncedValue(entityType.trim(), 350);
  const [debouncedTenantId] = useDebouncedValue(tenantId.trim(), 350);
  const filters = useMemo<AuditLogFilters>(
    () => ({
      action: debouncedAction,
      actorUserId: debouncedActorUserId,
      entityType: debouncedEntityType,
      tenantId: debouncedTenantId,
    }),
    [
      debouncedAction,
      debouncedActorUserId,
      debouncedEntityType,
      debouncedTenantId,
    ],
  );
  const auditLogsQuery = useInfiniteQuery<
    Paginated<AdminAuditLog>,
    Error,
    InfiniteData<Paginated<AdminAuditLog>>,
    ['adminAuditLogs', AuditLogFilters],
    string | null
  >({
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      listAdminAuditLogs(buildAuditLogParams(filters, pageParam)),
    queryKey: ['adminAuditLogs', filters],
  });
  const auditLogs = useMemo(
    () => auditLogsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [auditLogsQuery.data],
  );

  return (
    <Stack gap="xl">
      <AdminPageHeader
        badge={t('auditLogs.page.badge')}
        icon={IconHistory}
        subtitle={t('auditLogs.page.subtitle')}
        title={t('auditLogs.page.title')}
      />

      <Paper p="lg" radius="sm" withBorder>
        <Stack gap="md">
          <Group justify="space-between" wrap="wrap">
            <Stack gap={2}>
              <Title order={2} size="h4">
                {t('auditLogs.list.title')}
              </Title>
              <Text c="dimmed" size="sm">
                {t('auditLogs.list.loaded', { count: auditLogs.length })}
              </Text>
            </Stack>
            <Button
              leftSection={<IconRefresh size={18} />}
              loading={auditLogsQuery.isRefetching}
              onClick={() => void auditLogsQuery.refetch()}
              variant="light"
            >
              {t('actions.refresh')}
            </Button>
          </Group>

          <Group align="flex-end" gap="sm" wrap="wrap">
            <TextInput
              label={t('filters.tenantId')}
              onChange={(event) => setTenantId(event.currentTarget.value)}
              placeholder={t('filters.idPlaceholder')}
              value={tenantId}
              w={{ base: '100%', sm: 250 }}
            />
            <TextInput
              label={t('filters.actorUserId')}
              onChange={(event) => setActorUserId(event.currentTarget.value)}
              placeholder={t('filters.idPlaceholder')}
              value={actorUserId}
              w={{ base: '100%', sm: 250 }}
            />
            <TextInput
              label={t('filters.action')}
              onChange={(event) => setAction(event.currentTarget.value)}
              placeholder={t('filters.actionPlaceholder')}
              value={action}
              w={{ base: '100%', sm: 220 }}
            />
            <TextInput
              label={t('filters.entityType')}
              onChange={(event) => setEntityType(event.currentTarget.value)}
              placeholder={t('filters.entityTypePlaceholder')}
              value={entityType}
              w={{ base: '100%', sm: 220 }}
            />
          </Group>

          <AuditLogsTableContent
            auditLogs={auditLogs}
            error={auditLogsQuery.error}
            hasNextPage={Boolean(auditLogsQuery.hasNextPage)}
            isFetchingNextPage={auditLogsQuery.isFetchingNextPage}
            isPending={auditLogsQuery.isPending}
            onLoadMore={() => void auditLogsQuery.fetchNextPage()}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}

export function AdminAuditLogsPage() {
  return (
    <AdminAccessGuard>
      <AdminAuditLogsContent />
    </AdminAccessGuard>
  );
}
