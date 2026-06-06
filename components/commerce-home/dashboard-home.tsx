'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconBuildingStore,
  IconCoin,
  IconPackage,
  IconReceipt,
  IconRefresh,
  IconShoppingCart,
} from '@tabler/icons-react';
import { useLocale } from 'next-intl';

import { getDashboardStats } from '@/lib/api/dashboard';
import { useSessionStore } from '@/store/session';

import {
  EMPTY_DASHBOARD_STATS,
  formatCheckedAt,
  formatMoneyTotals,
  formatNumber,
} from './dashboard-formatting';
import {
  BenefitFlowPanel,
  OrdersOverviewPanel,
  ProductsContactsPanel,
} from './dashboard-overview-panels';
import { StatCard } from './dashboard-stat-card';

export function CommerceDashboardHome() {
  const locale = useLocale();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const tenants = useSessionStore((state) => state.tenants);
  const user = useSessionStore((state) => state.user);
  const selectedTenant = tenants.find(
    (tenant) => tenant.id === selectedTenantId,
  );
  const statsQuery = useQuery({
    enabled: Boolean(selectedTenantId),
    queryFn: getDashboardStats,
    queryKey: ['dashboardStats', selectedTenantId],
  });
  const stats = statsQuery.data ?? EMPTY_DASHBOARD_STATS;
  const isLoadingStats = statsQuery.isPending && Boolean(selectedTenantId);

  if (!selectedTenantId) {
    return (
      <Alert color="yellow" icon={<IconAlertTriangle size={18} />}>
        Select a workspace to load dashboard statistics.
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      <Group align="flex-start" justify="space-between" wrap="wrap">
        <Stack gap={4}>
          <Group gap="sm">
            <ThemeIcon color="blue" radius="sm" variant="light">
              <IconBuildingStore size={18} />
            </ThemeIcon>
            <Title order={1} size="h2">
              Dashboard
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            Benefit and commerce statistics for {selectedTenant?.name}.
          </Text>
        </Stack>
        <Group gap="sm">
          {selectedTenant ? (
            <Badge radius="sm" size="lg" variant="light">
              {selectedTenant.role}
            </Badge>
          ) : null}
          <Button
            leftSection={<IconRefresh size={16} />}
            loading={statsQuery.isRefetching}
            onClick={() => void statsQuery.refetch()}
            size="sm"
            variant="light"
          >
            Refresh
          </Button>
        </Group>
      </Group>

      <Paper p="lg" radius="sm" withBorder>
        <Group align="flex-start" justify="space-between" wrap="wrap">
          <Stack gap={2}>
            <Text c="dimmed" size="sm">
              Signed in as
            </Text>
            <Text fw={700}>{user?.displayName ?? 'Unknown user'}</Text>
            <Text c="dimmed" size="sm">
              {user?.email ?? 'No email loaded'}
            </Text>
          </Stack>
          {selectedTenant ? (
            <Stack gap={2}>
              <Text c="dimmed" size="sm">
                Workspace
              </Text>
              <Text fw={700}>{selectedTenant.name}</Text>
              <Text c="dimmed" size="sm">
                {selectedTenant.slug}
              </Text>
            </Stack>
          ) : null}
          <Stack gap={2}>
            <Text c="dimmed" size="sm">
              Updated
            </Text>
            <Text fw={700}>{formatCheckedAt(stats.checkedAt, locale)}</Text>
            <Text c="dimmed" size="sm">
              Tenant statistics
            </Text>
          </Stack>
        </Group>
      </Paper>

      {statsQuery.error ? (
        <Alert color="red" icon={<IconAlertTriangle size={18} />}>
          Could not load dashboard statistics. Try refreshing the dashboard.
        </Alert>
      ) : null}

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatCard
          color="blue"
          icon={IconCoin}
          isLoading={isLoadingStats}
          label="Gross revenue"
          meta={`${formatNumber(stats.orders.paid, locale)} paid orders`}
          value={formatMoneyTotals(stats.orders.grossAmount, locale)}
        />
        <StatCard
          color="orange"
          icon={IconShoppingCart}
          isLoading={isLoadingStats}
          label="Open orders"
          meta={`${formatNumber(stats.orders.needsReview, locale)} need review`}
          value={formatNumber(stats.orders.open, locale)}
        />
        <StatCard
          color="teal"
          icon={IconPackage}
          isLoading={isLoadingStats}
          label="Active products"
          meta={`${formatNumber(stats.products.lowStock, locale)} low stock`}
          value={formatNumber(stats.products.active, locale)}
        />
        <StatCard
          color="grape"
          icon={IconReceipt}
          isLoading={isLoadingStats}
          label="Pending benefit"
          meta={formatMoneyTotals(stats.commissions.pendingAmount, locale)}
          value={formatNumber(stats.commissions.pending, locale)}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <OrdersOverviewPanel
          isLoading={isLoadingStats}
          locale={locale}
          stats={stats}
        />
        <ProductsContactsPanel
          isLoading={isLoadingStats}
          locale={locale}
          stats={stats}
        />
      </SimpleGrid>

      <BenefitFlowPanel
        isLoading={isLoadingStats}
        locale={locale}
        stats={stats}
      />
    </Stack>
  );
}
