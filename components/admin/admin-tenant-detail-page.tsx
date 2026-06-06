'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
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
  IconArrowLeft,
  IconBuildingCommunity,
  IconBrandWhatsapp,
  IconBriefcase,
  IconPackage,
  IconPhoto,
  IconUserCheck,
} from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import { getAdminTenant } from '@/lib/api/admin';
import { getApiErrorMessage } from '@/lib/api/errors';
import type { AdminTenantDetailResponse } from '@/lib/api/admin-types';

import { AdminAccessGuard } from './admin-access-guard';
import { AdminPageHeader } from './admin-page-header';
import {
  TenantUsersTable,
  TenantWhatsappTable,
} from './admin-tenant-detail-tables';
import {
  formatAdminDate,
  formatAdminNumber,
  TenantPlanBadge,
  TenantStatusBadge,
} from './admin-ui';

const ADMIN_TRANSLATIONS = 'common.admin';
const DATE_NEVER_KEY = 'date.never';

type AdminTenantDetailPageProps = {
  tenantId: string;
};

type CountCardProps = {
  icon: React.ElementType;
  label: string;
  value: number;
};

function CountCard({ icon: Icon, label, value }: CountCardProps) {
  const locale = useLocale();

  return (
    <Paper p="md" radius="sm" withBorder>
      <Group gap="sm" wrap="nowrap">
        <Box c="violet">
          <Icon size={22} />
        </Box>
        <Stack gap={0} miw={0}>
          <Text c="dimmed" size="xs">
            {label}
          </Text>
          <Text fw={700} size="lg">
            {formatAdminNumber(value, locale)}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}

function TenantSummary({ data }: { data: AdminTenantDetailResponse }) {
  const locale = useLocale();
  const t = useTranslations(ADMIN_TRANSLATIONS);

  return (
    <Paper p="lg" radius="sm" withBorder>
      <Stack gap="md">
        <Group justify="space-between" wrap="wrap">
          <Stack gap={2}>
            <Title order={2} size="h4">
              {data.tenant.name}
            </Title>
            <Text c="dimmed" size="sm">
              {data.tenant.slug}
            </Text>
          </Stack>
          <Group gap="xs">
            <TenantStatusBadge
              label={t(`tenantStatus.${data.tenant.status}`)}
              status={data.tenant.status}
            />
            <TenantPlanBadge
              label={t(`tenantPlan.${data.tenant.plan}`)}
              plan={data.tenant.plan}
            />
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Text size="sm">
            <Text component="span" c="dimmed" inherit>
              {t('tenantDetail.summary.created')}:{' '}
            </Text>
            {formatAdminDate(data.tenant.createdAt, t(DATE_NEVER_KEY), locale)}
          </Text>
          <Text size="sm">
            <Text component="span" c="dimmed" inherit>
              {t('tenantDetail.summary.updated')}:{' '}
            </Text>
            {formatAdminDate(data.tenant.updatedAt, t(DATE_NEVER_KEY), locale)}
          </Text>
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}

function TenantCounts({ data }: { data: AdminTenantDetailResponse }) {
  const t = useTranslations(ADMIN_TRANSLATIONS);

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
      <CountCard
        icon={IconUserCheck}
        label={t('tenantDetail.counts.activeUsers')}
        value={data.counts.activeUsers}
      />
      <CountCard
        icon={IconBrandWhatsapp}
        label={t('tenantDetail.counts.whatsappAccounts')}
        value={data.counts.whatsappAccounts}
      />
      <CountCard
        icon={IconPackage}
        label={t('tenantDetail.counts.products')}
        value={data.counts.products}
      />
      <CountCard
        icon={IconBriefcase}
        label={t('tenantDetail.counts.orders')}
        value={data.counts.orders}
      />
      <CountCard
        icon={IconAlertTriangle}
        label={t('tenantDetail.counts.untrackedMessagesPendingDeletion')}
        value={data.counts.untrackedMessagesPendingDeletion}
      />
      <CountCard
        icon={IconPhoto}
        label={t('tenantDetail.counts.temporaryMediaObjects')}
        value={data.counts.temporaryMediaObjects}
      />
    </SimpleGrid>
  );
}

function TenantDetailContent({ tenantId }: AdminTenantDetailPageProps) {
  const t = useTranslations(ADMIN_TRANSLATIONS);
  const tenantQuery = useQuery({
    queryFn: () => getAdminTenant(tenantId),
    queryKey: ['adminTenant', tenantId],
  });
  const data = tenantQuery.data ?? null;

  if (tenantQuery.isPending) {
    return (
      <Box py="xl" ta="center">
        <Loader />
      </Box>
    );
  }

  if (tenantQuery.error || !data) {
    return (
      <Alert color="red" icon={<IconAlertTriangle size={18} />}>
        {getApiErrorMessage(tenantQuery.error)}
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      <Group justify="space-between" wrap="wrap">
        <AdminPageHeader
          badge={t('tenantDetail.page.badge')}
          icon={IconBuildingCommunity}
          subtitle={t('tenantDetail.page.subtitle')}
          title={data.tenant.name}
        />
        <Button
          component={Link}
          href="/admin/tenants"
          leftSection={<IconArrowLeft size={18} />}
          variant="light"
        >
          {t('actions.backToTenants')}
        </Button>
      </Group>

      <TenantSummary data={data} />
      <TenantCounts data={data} />
      <TenantUsersTable data={data} />
      <TenantWhatsappTable data={data} />
    </Stack>
  );
}

export function AdminTenantDetailPage({
  tenantId,
}: AdminTenantDetailPageProps) {
  return (
    <AdminAccessGuard>
      <TenantDetailContent tenantId={tenantId} />
    </AdminAccessGuard>
  );
}
