'use client';

import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconBriefcase,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { getApiErrorMessage } from '@/lib/api/errors';
import type { Order } from '@/lib/api/types';

import { OrderRow } from './order-row';
import {
  type DeliveryStatusFilter,
  DELIVERY_STATUS_FILTER_OPTIONS,
  ORDER_FILTER_ALL,
  type OrderStatusFilter,
  ORDER_STATUS_FILTER_OPTIONS,
  type PaymentStatusFilter,
  PAYMENT_STATUS_FILTER_OPTIONS,
} from './orders-ui';

type OrderListPanelProps = {
  activeOrderId: string | null;
  deliveryStatusFilter: DeliveryStatusFilter;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  isRefetching: boolean;
  onDeliveryStatusFilterChange: (status: DeliveryStatusFilter) => void;
  onLoadMore: () => void;
  onOrderSelect: (orderId: string) => void;
  onPaymentStatusFilterChange: (status: PaymentStatusFilter) => void;
  onRefresh: () => void;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: OrderStatusFilter) => void;
  orders: Order[];
  paymentStatusFilter: PaymentStatusFilter;
  search: string;
  statusFilter: OrderStatusFilter;
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

function OrderListContent({
  activeOrderId,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  onLoadMore,
  onOrderSelect,
  orders,
}: Pick<
  OrderListPanelProps,
  | 'activeOrderId'
  | 'error'
  | 'hasNextPage'
  | 'isFetchingNextPage'
  | 'isPending'
  | 'onLoadMore'
  | 'onOrderSelect'
  | 'orders'
>) {
  const t = useTranslations('common.orders');

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

  if (orders.length === 0) {
    return (
      <Alert color="gray" icon={<IconBriefcase size={18} />}>
        {t('empty.noOrders')}
      </Alert>
    );
  }

  return (
    <Stack gap="sm">
      {orders.map((order) => (
        <OrderRow
          key={order.id}
          isActive={activeOrderId === order.id}
          onSelect={onOrderSelect}
          order={order}
        />
      ))}

      {hasNextPage ? (
        <Group justify="center" pt="sm">
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

export function OrderListPanel({
  activeOrderId,
  deliveryStatusFilter,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  isRefetching,
  onDeliveryStatusFilterChange,
  onLoadMore,
  onOrderSelect,
  onPaymentStatusFilterChange,
  onRefresh,
  onSearchChange,
  onStatusFilterChange,
  orders,
  paymentStatusFilter,
  search,
  statusFilter,
}: OrderListPanelProps) {
  const t = useTranslations('common.orders');
  const paymentStatusOptions = useMemo(
    () => buildSelectData(PAYMENT_STATUS_FILTER_OPTIONS, t),
    [t],
  );
  const deliveryStatusOptions = useMemo(
    () => buildSelectData(DELIVERY_STATUS_FILTER_OPTIONS, t),
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
              {t('list.loaded', { count: orders.length })}
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

        <Tabs
          onChange={(value) =>
            onStatusFilterChange(
              (value as OrderStatusFilter | null) ?? ORDER_FILTER_ALL,
            )
          }
          value={statusFilter}
          variant="outline"
        >
          <ScrollArea offsetScrollbars type="auto">
            <Tabs.List style={{ flexWrap: 'nowrap', minWidth: 'max-content' }}>
              {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
                <Tabs.Tab key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </ScrollArea>
        </Tabs>

        <Group align="flex-end" gap="sm" wrap="wrap">
          <Select
            allowDeselect={false}
            data={paymentStatusOptions}
            label={t('filters.paymentStatus')}
            onChange={(value) =>
              onPaymentStatusFilterChange(
                (value as PaymentStatusFilter | null) ?? ORDER_FILTER_ALL,
              )
            }
            value={paymentStatusFilter}
            w={{ base: '100%', sm: 220 }}
          />
          <Select
            allowDeselect={false}
            data={deliveryStatusOptions}
            label={t('filters.deliveryStatus')}
            onChange={(value) =>
              onDeliveryStatusFilterChange(
                (value as DeliveryStatusFilter | null) ?? ORDER_FILTER_ALL,
              )
            }
            value={deliveryStatusFilter}
            w={{ base: '100%', sm: 220 }}
          />
          <TextInput
            label={t('filters.search')}
            leftSection={<IconSearch size={16} />}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            placeholder={t('filters.searchPlaceholder')}
            value={search}
            w={{ base: '100%', sm: 280 }}
          />
        </Group>

        <OrderListContent
          activeOrderId={activeOrderId}
          error={error}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isPending={isPending}
          onLoadMore={onLoadMore}
          onOrderSelect={onOrderSelect}
          orders={orders}
        />
      </Stack>
    </Paper>
  );
}
