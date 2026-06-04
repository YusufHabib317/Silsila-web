'use client';

import type { InfiniteData } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
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
import { IconAlertTriangle, IconBriefcase } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import {
  getOrder,
  listOrders,
  type ListOrdersParams,
  updateOrderStatus,
} from '@/lib/api/orders';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ensureCsrfToken } from '@/lib/api/session-token';
import type { Order, OrderStatus, Paginated } from '@/lib/api/types';
import { useSessionStore } from '@/store/session';

import { OrderDetailPanel } from './order-detail-panel';
import { OrderListPanel } from './order-list-panel';
import {
  type DeliveryStatusFilter,
  ORDER_FILTER_ALL,
  type OrderStatusFilter,
  type PaymentStatusFilter,
} from './orders-ui';

const ORDER_PAGE_LIMIT = 50;

type OrderFilters = {
  deliveryStatusFilter: DeliveryStatusFilter;
  paymentStatusFilter: PaymentStatusFilter;
  search: string;
  statusFilter: OrderStatusFilter;
};

type UpdateOrderStatusVariables = {
  orderId: string;
  status: OrderStatus;
};

function buildOrderParams(
  filters: OrderFilters,
  cursor: string | null,
): ListOrdersParams {
  const params: ListOrdersParams = {
    cursor,
    limit: ORDER_PAGE_LIMIT,
  };

  if (filters.statusFilter !== ORDER_FILTER_ALL) {
    params.status = filters.statusFilter;
  }

  if (filters.paymentStatusFilter !== ORDER_FILTER_ALL) {
    params.paymentStatus = filters.paymentStatusFilter;
  }

  if (filters.deliveryStatusFilter !== ORDER_FILTER_ALL) {
    params.deliveryStatus = filters.deliveryStatusFilter;
  }

  if (filters.search) {
    params.search = filters.search;
  }

  return params;
}

export function OrdersPage() {
  const t = useTranslations('common.orders');
  const queryClient = useQueryClient();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [deliveryStatusFilter, setDeliveryStatusFilter] =
    useState<DeliveryStatusFilter>(ORDER_FILTER_ALL);
  const [paymentStatusFilter, setPaymentStatusFilter] =
    useState<PaymentStatusFilter>(ORDER_FILTER_ALL);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<OrderStatusFilter>(ORDER_FILTER_ALL);
  const [debouncedSearch] = useDebouncedValue(search.trim(), 350);
  const filters = useMemo<OrderFilters>(
    () => ({
      deliveryStatusFilter,
      paymentStatusFilter,
      search: debouncedSearch,
      statusFilter,
    }),
    [debouncedSearch, deliveryStatusFilter, paymentStatusFilter, statusFilter],
  );

  const ordersQuery = useInfiniteQuery<
    Paginated<Order>,
    Error,
    InfiniteData<Paginated<Order>>,
    ['orders', string | null, OrderFilters],
    string | null
  >({
    enabled: Boolean(selectedTenantId),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      listOrders(buildOrderParams(filters, pageParam)),
    queryKey: ['orders', selectedTenantId, filters],
  });
  const detailQuery = useQuery({
    enabled: Boolean(activeOrderId),
    queryFn: () => {
      if (!activeOrderId) {
        throw new Error(t('errors.orderIdMissing'));
      }

      return getOrder(activeOrderId);
    },
    queryKey: ['order', selectedTenantId, activeOrderId],
  });

  const statusMutation = useMutation({
    mutationFn: async ({ orderId, status }: UpdateOrderStatusVariables) => {
      await ensureCsrfToken();

      return updateOrderStatus(orderId, status);
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('notifications.statusUpdateFailed'),
      });
    },
    onSuccess: (order) => {
      queryClient.setQueryData(['order', selectedTenantId, order.id], order);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.show({
        color: 'green',
        message: t('notifications.statusUpdateSuccessMessage', {
          orderNumber: order.orderNumber,
          status: t(`status.${order.status}`),
        }),
        title: t('notifications.statusUpdateSuccessTitle'),
      });
    },
  });

  const orders = useMemo(
    () => ordersQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [ordersQuery.data],
  );

  function handleStatusFilterChange(nextStatus: OrderStatusFilter) {
    setStatusFilter(nextStatus);
    setActiveOrderId(null);
  }

  function handlePaymentStatusFilterChange(nextStatus: PaymentStatusFilter) {
    setPaymentStatusFilter(nextStatus);
    setActiveOrderId(null);
  }

  function handleDeliveryStatusFilterChange(nextStatus: DeliveryStatusFilter) {
    setDeliveryStatusFilter(nextStatus);
    setActiveOrderId(null);
  }

  function handleOrderStatusChange(orderId: string, status: OrderStatus) {
    statusMutation.mutate({ orderId, status });
  }

  if (!selectedTenantId) {
    return (
      <Alert color="yellow" icon={<IconAlertTriangle size={18} />}>
        {t('empty.selectTenant')}
      </Alert>
    );
  }

  return (
    <Stack gap="xl">
      <Group align="flex-start" justify="space-between">
        <Stack gap={4}>
          <Group gap="sm">
            <ThemeIcon color="orange" radius="sm" variant="light">
              <IconBriefcase size={18} />
            </ThemeIcon>
            <Title order={1} size="h2">
              {t('page.title')}
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            {t('page.subtitle')}
          </Text>
        </Stack>
        <Badge color="orange" radius="sm" size="lg" variant="light">
          {t('page.badge')}
        </Badge>
      </Group>

      <Grid align="stretch">
        <Grid.Col span={{ base: 12, xl: 7 }}>
          <OrderListPanel
            activeOrderId={activeOrderId}
            deliveryStatusFilter={deliveryStatusFilter}
            error={ordersQuery.error}
            hasNextPage={Boolean(ordersQuery.hasNextPage)}
            isFetchingNextPage={ordersQuery.isFetchingNextPage}
            isPending={ordersQuery.isPending}
            isRefetching={ordersQuery.isRefetching}
            onDeliveryStatusFilterChange={handleDeliveryStatusFilterChange}
            onLoadMore={() => void ordersQuery.fetchNextPage()}
            onOrderSelect={setActiveOrderId}
            onPaymentStatusFilterChange={handlePaymentStatusFilterChange}
            onRefresh={() => void ordersQuery.refetch()}
            onSearchChange={setSearch}
            onStatusFilterChange={handleStatusFilterChange}
            orders={orders}
            paymentStatusFilter={paymentStatusFilter}
            search={search}
            statusFilter={statusFilter}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, xl: 5 }}>
          <OrderDetailPanel
            error={detailQuery.error}
            isPending={detailQuery.isPending && Boolean(activeOrderId)}
            isUpdatingStatus={statusMutation.isPending}
            onStatusChange={handleOrderStatusChange}
            order={detailQuery.data ?? null}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
