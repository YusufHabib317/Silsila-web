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
  IconBrandWhatsapp,
  IconDatabase,
  IconMessageCircle,
  IconRefresh,
  IconServer,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import { getAdminSystemHealth, getAdminSystemMetrics } from '@/lib/api/admin';
import { getApiErrorMessage } from '@/lib/api/errors';
import type {
  AdminSystemHealth,
  AdminSystemMetrics,
} from '@/lib/api/admin-types';

import { AdminAccessGuard } from './admin-access-guard';
import { AdminPageHeader } from './admin-page-header';
import {
  formatAdminDate,
  formatAdminNumber,
  formatStorageBytes,
  GenericStatusBadge,
} from './admin-ui';

const ADMIN_TRANSLATIONS = 'common.admin';

type MetricCardProps = {
  icon: React.ElementType;
  label: string;
  value: string;
};

function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
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
          <Text fw={700} lineClamp={1} size="lg">
            {value}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}

function StatusBreakdown({
  entries,
  title,
}: {
  entries: Record<string, number>;
  title: string;
}) {
  const locale = useLocale();

  return (
    <Paper p="lg" radius="sm" withBorder>
      <Stack gap="md">
        <Title order={2} size="h4">
          {title}
        </Title>
        {Object.keys(entries).length === 0 ? (
          <Text c="dimmed" size="sm">
            0
          </Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {Object.entries(entries).map(([status, count]) => (
              <Group key={status} justify="space-between" wrap="nowrap">
                <GenericStatusBadge label={status} status={status} />
                <Text fw={700}>{formatAdminNumber(count, locale)}</Text>
              </Group>
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Paper>
  );
}

function MetricsSummary({ metrics }: { metrics: AdminSystemMetrics }) {
  const locale = useLocale();
  const t = useTranslations(ADMIN_TRANSLATIONS);

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
      <MetricCard
        icon={IconDatabase}
        label={t('system.metrics.tenants')}
        value={formatAdminNumber(metrics.tenants.total, locale)}
      />
      <MetricCard
        icon={IconBrandWhatsapp}
        label={t('system.metrics.whatsappAccounts')}
        value={formatAdminNumber(metrics.whatsappAccounts.total, locale)}
      />
      <MetricCard
        icon={IconMessageCircle}
        label={t('system.metrics.receivedToday')}
        value={formatAdminNumber(metrics.messages.receivedToday, locale)}
      />
      <MetricCard
        icon={IconShieldCheck}
        label={t('system.metrics.trackedToday')}
        value={formatAdminNumber(metrics.messages.trackedToday, locale)}
      />
      <MetricCard
        icon={IconAlertTriangle}
        label={t('system.metrics.expiredPendingDeletion')}
        value={formatAdminNumber(
          metrics.messages.expiredUntrackedPendingDeletion,
          locale,
        )}
      />
      <MetricCard
        icon={IconServer}
        label={t('system.metrics.temporaryStorage')}
        value={formatStorageBytes(
          metrics.storage.temporaryStorageBytes,
          locale,
        )}
      />
    </SimpleGrid>
  );
}

function HealthPanel({ health }: { health: AdminSystemHealth }) {
  const locale = useLocale();
  const t = useTranslations(ADMIN_TRANSLATIONS);

  return (
    <Paper p="lg" radius="sm" withBorder>
      <Stack gap="md">
        <Group justify="space-between" wrap="wrap">
          <Title order={2} size="h4">
            {t('system.health.title')}
          </Title>
          <GenericStatusBadge
            label={health.api.status}
            status={health.api.status}
          />
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <Stack gap={2}>
            <Text c="dimmed" size="xs">
              {t('system.health.api')}
            </Text>
            <Text fw={700}>{health.api.service}</Text>
          </Stack>
          <Stack gap={2}>
            <Text c="dimmed" size="xs">
              {t('system.health.whatsappWorker')}
            </Text>
            <GenericStatusBadge
              label={health.workers.whatsapp}
              status={health.workers.whatsapp}
            />
          </Stack>
          <Stack gap={2}>
            <Text c="dimmed" size="xs">
              {t('system.health.cleanupWorker')}
            </Text>
            <GenericStatusBadge
              label={health.workers.cleanup}
              status={health.workers.cleanup}
            />
          </Stack>
          <Stack gap={2}>
            <Text c="dimmed" size="xs">
              {t('system.health.r2')}
            </Text>
            <GenericStatusBadge
              label={
                health.storage.r2Configured
                  ? t('system.health.configured')
                  : t('system.health.notConfigured')
              }
              status={health.storage.r2Configured ? 'ok' : 'missing'}
            />
          </Stack>
        </SimpleGrid>

        <Text c="dimmed" size="xs">
          {t('system.health.checkedAt')}:{' '}
          {formatAdminDate(health.api.checkedAt, t('date.never'), locale)}
        </Text>
      </Stack>
    </Paper>
  );
}

function AdminSystemContent() {
  const locale = useLocale();
  const t = useTranslations(ADMIN_TRANSLATIONS);
  const metricsQuery = useQuery({
    queryFn: getAdminSystemMetrics,
    queryKey: ['adminSystemMetrics'],
    refetchInterval: 30_000,
  });
  const healthQuery = useQuery({
    queryFn: getAdminSystemHealth,
    queryKey: ['adminSystemHealth'],
    refetchInterval: 30_000,
  });
  const isPending = metricsQuery.isPending || healthQuery.isPending;
  const error = metricsQuery.error ?? healthQuery.error;
  const metrics = metricsQuery.data ?? null;
  const health = healthQuery.data ?? null;

  function refresh() {
    void metricsQuery.refetch();
    void healthQuery.refetch();
  }

  return (
    <Stack gap="xl">
      <Group justify="space-between" wrap="wrap">
        <AdminPageHeader
          badge={t('system.page.badge')}
          icon={IconServer}
          subtitle={t('system.page.subtitle')}
          title={t('system.page.title')}
        />
        <Button
          leftSection={<IconRefresh size={18} />}
          loading={metricsQuery.isRefetching || healthQuery.isRefetching}
          onClick={refresh}
          variant="light"
        >
          {t('actions.refresh')}
        </Button>
      </Group>

      {isPending ? (
        <Box py="xl" ta="center">
          <Loader />
        </Box>
      ) : null}

      {error ? (
        <Alert color="red" icon={<IconAlertTriangle size={18} />}>
          {getApiErrorMessage(error)}
        </Alert>
      ) : null}

      {metrics ? (
        <>
          <MetricsSummary metrics={metrics} />
          <SimpleGrid cols={{ base: 1, lg: 2 }}>
            <StatusBreakdown
              entries={metrics.tenants.byStatus}
              title={t('system.breakdown.tenants')}
            />
            <StatusBreakdown
              entries={metrics.whatsappAccounts.byStatus}
              title={t('system.breakdown.whatsappAccounts')}
            />
          </SimpleGrid>
          <Text c="dimmed" size="xs">
            {t('system.metrics.checkedAt')}:{' '}
            {formatAdminDate(metrics.checkedAt, t('date.never'), locale)}
          </Text>
        </>
      ) : null}

      {health ? <HealthPanel health={health} /> : null}
    </Stack>
  );
}

export function AdminSystemPage() {
  return (
    <AdminAccessGuard>
      <AdminSystemContent />
    </AdminAccessGuard>
  );
}
