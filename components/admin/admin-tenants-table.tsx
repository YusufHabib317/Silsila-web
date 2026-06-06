'use client';

import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconBuildingCommunity,
  IconEye,
} from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import { getApiErrorMessage } from '@/lib/api/errors';
import type { AdminTenantListItem } from '@/lib/api/admin-types';

import {
  formatAdminDate,
  TenantPlanBadge,
  TenantStatusBadge,
} from './admin-ui';

const ADMIN_TRANSLATIONS = 'common.admin';

type TenantsTableContentProps = {
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  onLoadMore: () => void;
  tenants: AdminTenantListItem[];
};

export function TenantsTableContent({
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  onLoadMore,
  tenants,
}: TenantsTableContentProps) {
  const locale = useLocale();
  const t = useTranslations(ADMIN_TRANSLATIONS);

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

  if (tenants.length === 0) {
    return (
      <Alert color="gray" icon={<IconBuildingCommunity size={18} />}>
        {t('empty.noTenants')}
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Table.ScrollContainer minWidth={920}>
        <Table highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('tenants.table.tenant')}</Table.Th>
              <Table.Th>{t('tenants.table.status')}</Table.Th>
              <Table.Th>{t('tenants.table.plan')}</Table.Th>
              <Table.Th>{t('tenants.table.updated')}</Table.Th>
              <Table.Th ta="right">{t('tenants.table.actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tenants.map((tenant) => (
              <Table.Tr key={tenant.id}>
                <Table.Td>
                  <Stack gap={2}>
                    <Text fw={700}>{tenant.name}</Text>
                    <Text c="dimmed" size="xs">
                      {tenant.slug}
                    </Text>
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <TenantStatusBadge
                    label={t(`tenantStatus.${tenant.status}`)}
                    status={tenant.status}
                  />
                </Table.Td>
                <Table.Td>
                  <TenantPlanBadge
                    label={t(`tenantPlan.${tenant.plan}`)}
                    plan={tenant.plan}
                  />
                </Table.Td>
                <Table.Td>
                  {formatAdminDate(tenant.updatedAt, t('date.never'), locale)}
                </Table.Td>
                <Table.Td>
                  <Group justify="flex-end">
                    <Button
                      component={Link}
                      href={`/admin/tenants/${tenant.id}`}
                      leftSection={<IconEye size={16} />}
                      size="xs"
                      variant="light"
                    >
                      {t('actions.view')}
                    </Button>
                  </Group>
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
