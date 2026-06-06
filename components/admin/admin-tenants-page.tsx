'use client';

import type { InfiniteData } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconBuildingCommunity,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { listAdminTenants, type ListAdminTenantsParams } from '@/lib/api/admin';
import type { AdminTenantListItem } from '@/lib/api/admin-types';
import type { Paginated } from '@/lib/api/types';

import { AdminAccessGuard } from './admin-access-guard';
import { AdminPageHeader } from './admin-page-header';
import { TenantsTableContent } from './admin-tenants-table';
import {
  ADMIN_FILTER_ALL,
  ADMIN_TENANT_PLAN_FILTER_OPTIONS,
  ADMIN_TENANT_STATUS_FILTER_OPTIONS,
  type AdminTenantPlanFilter,
  type AdminTenantStatusFilter,
} from './admin-ui';

const TENANT_PAGE_LIMIT = 50;
const ADMIN_TRANSLATIONS = 'common.admin';

type TenantFilters = {
  planFilter: AdminTenantPlanFilter;
  search: string;
  statusFilter: AdminTenantStatusFilter;
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

function buildTenantParams(filters: TenantFilters, cursor: string | null) {
  const params: ListAdminTenantsParams = {
    cursor,
    limit: TENANT_PAGE_LIMIT,
  };

  if (filters.statusFilter !== ADMIN_FILTER_ALL) {
    params.status = filters.statusFilter;
  }

  if (filters.planFilter !== ADMIN_FILTER_ALL) {
    params.plan = filters.planFilter;
  }

  if (filters.search) {
    params.search = filters.search;
  }

  return params;
}

function AdminTenantsContent() {
  const t = useTranslations(ADMIN_TRANSLATIONS);
  const [planFilter, setPlanFilter] =
    useState<AdminTenantPlanFilter>(ADMIN_FILTER_ALL);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<AdminTenantStatusFilter>(ADMIN_FILTER_ALL);
  const [debouncedSearch] = useDebouncedValue(search.trim(), 350);
  const filters = useMemo<TenantFilters>(
    () => ({ planFilter, search: debouncedSearch, statusFilter }),
    [debouncedSearch, planFilter, statusFilter],
  );
  const statusOptions = useMemo(
    () => buildSelectData(ADMIN_TENANT_STATUS_FILTER_OPTIONS, t),
    [t],
  );
  const planOptions = useMemo(
    () => buildSelectData(ADMIN_TENANT_PLAN_FILTER_OPTIONS, t),
    [t],
  );
  const tenantsQuery = useInfiniteQuery<
    Paginated<AdminTenantListItem>,
    Error,
    InfiniteData<Paginated<AdminTenantListItem>>,
    ['adminTenants', TenantFilters],
    string | null
  >({
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      listAdminTenants(buildTenantParams(filters, pageParam)),
    queryKey: ['adminTenants', filters],
  });
  const tenants = useMemo(
    () => tenantsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [tenantsQuery.data],
  );

  return (
    <Stack gap="xl">
      <AdminPageHeader
        badge={t('tenants.page.badge')}
        icon={IconBuildingCommunity}
        subtitle={t('tenants.page.subtitle')}
        title={t('tenants.page.title')}
      />

      <Paper p="lg" radius="sm" withBorder>
        <Stack gap="md">
          <Group justify="space-between" wrap="wrap">
            <Stack gap={2}>
              <Title order={2} size="h4">
                {t('tenants.list.title')}
              </Title>
              <Text c="dimmed" size="sm">
                {t('tenants.list.loaded', { count: tenants.length })}
              </Text>
            </Stack>
            <Button
              leftSection={<IconRefresh size={18} />}
              loading={tenantsQuery.isRefetching}
              onClick={() => void tenantsQuery.refetch()}
              variant="light"
            >
              {t('actions.refresh')}
            </Button>
          </Group>

          <Group align="flex-end" gap="sm" wrap="wrap">
            <Select
              allowDeselect={false}
              data={statusOptions}
              label={t('filters.status')}
              onChange={(value) =>
                setStatusFilter(
                  (value as AdminTenantStatusFilter | null) ?? ADMIN_FILTER_ALL,
                )
              }
              value={statusFilter}
              w={{ base: '100%', sm: 200 }}
            />
            <Select
              allowDeselect={false}
              data={planOptions}
              label={t('filters.plan')}
              onChange={(value) =>
                setPlanFilter(
                  (value as AdminTenantPlanFilter | null) ?? ADMIN_FILTER_ALL,
                )
              }
              value={planFilter}
              w={{ base: '100%', sm: 200 }}
            />
            <TextInput
              label={t('filters.search')}
              leftSection={<IconSearch size={16} />}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder={t('filters.tenantSearchPlaceholder')}
              value={search}
              w={{ base: '100%', sm: 300 }}
            />
          </Group>

          <TenantsTableContent
            error={tenantsQuery.error}
            hasNextPage={Boolean(tenantsQuery.hasNextPage)}
            isFetchingNextPage={tenantsQuery.isFetchingNextPage}
            isPending={tenantsQuery.isPending}
            onLoadMore={() => void tenantsQuery.fetchNextPage()}
            tenants={tenants}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}

export function AdminTenantsPage() {
  return (
    <AdminAccessGuard>
      <AdminTenantsContent />
    </AdminAccessGuard>
  );
}
