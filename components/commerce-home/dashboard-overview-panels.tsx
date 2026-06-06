'use client';

import {
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconBriefcase,
  IconReceipt,
  IconUsersGroup,
} from '@tabler/icons-react';

import type { DashboardStats } from '@/lib/api/dashboard';

import { formatMoneyTotals, formatNumber } from './dashboard-formatting';
import { MetricLine, StatCard } from './dashboard-stat-card';

type DashboardPanelProps = {
  isLoading: boolean;
  locale: string;
  stats: DashboardStats;
};

export function OrdersOverviewPanel({
  isLoading,
  locale,
  stats,
}: DashboardPanelProps) {
  return (
    <Paper p="lg" radius="sm" withBorder>
      <Stack gap="lg">
        <Group justify="space-between" wrap="nowrap">
          <Stack gap={2}>
            <Text fw={800}>Orders</Text>
            <Text c="dimmed" size="sm">
              Sales movement and fulfillment health
            </Text>
          </Stack>
          <ThemeIcon color="orange" radius="sm" size="lg" variant="light">
            <IconBriefcase size={20} />
          </ThemeIcon>
        </Group>
        {isLoading ? (
          <Stack gap="md">
            <Skeleton h={18} radius="xs" />
            <Skeleton h={18} radius="xs" />
            <Skeleton h={18} radius="xs" />
          </Stack>
        ) : (
          <Stack gap="md">
            <MetricLine
              color="orange"
              label={`${formatNumber(stats.orders.open, locale)} open`}
              total={stats.orders.total}
              value={stats.orders.open}
            />
            <MetricLine
              color="green"
              label={`${formatNumber(stats.orders.paid, locale)} paid`}
              total={stats.orders.total}
              value={stats.orders.paid}
            />
            <MetricLine
              color="blue"
              label={`${formatNumber(stats.orders.delivered, locale)} delivered`}
              total={stats.orders.total}
              value={stats.orders.delivered}
            />
          </Stack>
        )}
        <Divider />
        <Group justify="space-between" wrap="wrap">
          <Stack gap={2}>
            <Text c="dimmed" size="sm">
              Total orders
            </Text>
            <Text fw={800}>{formatNumber(stats.orders.total, locale)}</Text>
          </Stack>
          <Stack align="flex-end" gap={2}>
            <Text c="dimmed" size="sm">
              Paid revenue
            </Text>
            <Text fw={800}>
              {formatMoneyTotals(stats.orders.paidAmount, locale)}
            </Text>
          </Stack>
        </Group>
      </Stack>
    </Paper>
  );
}

export function ProductsContactsPanel({
  isLoading,
  locale,
  stats,
}: DashboardPanelProps) {
  return (
    <Paper p="lg" radius="sm" withBorder>
      <Stack gap="lg">
        <Group justify="space-between" wrap="nowrap">
          <Stack gap={2}>
            <Text fw={800}>Products and contacts</Text>
            <Text c="dimmed" size="sm">
              Catalog readiness and partner coverage
            </Text>
          </Stack>
          <ThemeIcon color="teal" radius="sm" size="lg" variant="light">
            <IconUsersGroup size={20} />
          </ThemeIcon>
        </Group>
        {isLoading ? (
          <Stack gap="md">
            <Skeleton h={18} radius="xs" />
            <Skeleton h={18} radius="xs" />
            <Skeleton h={18} radius="xs" />
          </Stack>
        ) : (
          <Stack gap="md">
            <MetricLine
              color="teal"
              label={`${formatNumber(stats.products.active, locale)} active products`}
              total={stats.products.total}
              value={stats.products.active}
            />
            <MetricLine
              color="yellow"
              label={`${formatNumber(stats.products.lowStock, locale)} low stock`}
              total={stats.products.total}
              value={stats.products.lowStock}
            />
            <MetricLine
              color="red"
              label={`${formatNumber(stats.products.outOfStock, locale)} out of stock`}
              total={stats.products.total}
              value={stats.products.outOfStock}
            />
          </Stack>
        )}
        <Divider />
        <SimpleGrid cols={{ base: 2, sm: 4 }}>
          <Stack gap={2}>
            <Text c="dimmed" size="sm">
              Contacts
            </Text>
            <Text fw={800}>{formatNumber(stats.contacts.total, locale)}</Text>
          </Stack>
          <Stack gap={2}>
            <Text c="dimmed" size="sm">
              Merchants
            </Text>
            <Text fw={800}>
              {formatNumber(stats.contacts.merchants, locale)}
            </Text>
          </Stack>
          <Stack gap={2}>
            <Text c="dimmed" size="sm">
              Agents
            </Text>
            <Text fw={800}>{formatNumber(stats.contacts.agents, locale)}</Text>
          </Stack>
          <Stack gap={2}>
            <Text c="dimmed" size="sm">
              Customers
            </Text>
            <Text fw={800}>
              {formatNumber(stats.contacts.customers, locale)}
            </Text>
          </Stack>
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}

export function BenefitFlowPanel({
  isLoading,
  locale,
  stats,
}: DashboardPanelProps) {
  return (
    <Stack gap="md">
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={2}>
          <Text fw={800}>Benefit flow</Text>
          <Text c="dimmed" size="sm">
            Commission amounts grouped by approval status
          </Text>
        </Stack>
        <ThemeIcon color="grape" radius="sm" size="lg" variant="light">
          <IconReceipt size={20} />
        </ThemeIcon>
      </Group>
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <StatCard
          color="yellow"
          icon={IconReceipt}
          isLoading={isLoading}
          label="Pending"
          meta={formatMoneyTotals(stats.commissions.pendingAmount, locale)}
          value={formatNumber(stats.commissions.pending, locale)}
        />
        <StatCard
          color="blue"
          icon={IconReceipt}
          isLoading={isLoading}
          label="Approved"
          meta={formatMoneyTotals(stats.commissions.approvedAmount, locale)}
          value={formatNumber(stats.commissions.approved, locale)}
        />
        <StatCard
          color="green"
          icon={IconReceipt}
          isLoading={isLoading}
          label="Paid"
          meta={formatMoneyTotals(stats.commissions.paidAmount, locale)}
          value={formatNumber(stats.commissions.paid, locale)}
        />
      </SimpleGrid>
    </Stack>
  );
}
