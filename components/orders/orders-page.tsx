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
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  getOrder,
  listOrders,
  updateOrder,
  updateOrderStatus,
} from '@/lib/api/orders';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ensureCsrfToken } from '@/lib/api/session-token';
import type { Order, OrderStatus, Paginated } from '@/lib/api/types';
import { useSessionStore } from '@/store/session';

import { OrderDetailPanel } from './order-detail-panel';
import { listOrderFormOptions } from './order-form-options';
import {
  OrderFormPanel,
  type OrderFormMode,
  type OrderFormValues,
} from './order-form-panel';
import { OrderListPanel } from './order-list-panel';
import {
  buildOrderParams,
  buildUpdateOrderRequest,
  type OrderFilters,
} from './order-requests';
import {
  type DeliveryStatusFilter,
  ORDER_FILTER_ALL,
  type OrderStatusFilter,
  type PaymentStatusFilter,
} from './orders-ui';

type UpdateOrderStatusVariables = {
  orderId: string;
  status: OrderStatus;
};

type UpdateOrderVariables = {
  orderId: string;
  values: OrderFormValues;
};

const EMPTY_OPTIONS = {
  agentContactOptions: [],
  customerContactOptions: [],
  merchantContactOptions: [],
  productOptions: [],
};

export function OrdersPage() {
  const t = useTranslations('common.orders');
  const queryClient = useQueryClient();
  const router = useRouter();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<OrderFormMode>('create');
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
  const formOptionsQuery = useQuery({
    enabled: Boolean(selectedTenantId),
    queryFn: listOrderFormOptions,
    queryKey: ['orderFormOptions', selectedTenantId],
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
  const updateMutation = useMutation({
    mutationFn: async ({ orderId, values }: UpdateOrderVariables) => {
      await ensureCsrfToken();

      return updateOrder(orderId, buildUpdateOrderRequest(values));
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('notifications.updateFailed'),
      });
    },
    onSuccess: (order) => {
      queryClient.setQueryData(['order', selectedTenantId, order.id], order);
      setActiveOrderId(order.id);
      setFormMode('create');
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.show({
        color: 'green',
        message: t('notifications.updateSuccessMessage', {
          orderNumber: order.orderNumber,
        }),
        title: t('notifications.updateSuccessTitle'),
      });
    },
  });

  const orders = useMemo(
    () => ordersQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [ordersQuery.data],
  );
  const formOptions = formOptionsQuery.data ?? EMPTY_OPTIONS;
  const editingOrder = formMode === 'edit' ? (detailQuery.data ?? null) : null;

  function resetSelectionForFilterChange() {
    setActiveOrderId(null);
    setFormMode('create');
  }

  function handleOrderSelect(orderId: string) {
    setActiveOrderId(orderId);
    setFormMode('create');
  }

  function handleStatusFilterChange(nextStatus: OrderStatusFilter) {
    setStatusFilter(nextStatus);
    resetSelectionForFilterChange();
  }

  function handlePaymentStatusFilterChange(nextStatus: PaymentStatusFilter) {
    setPaymentStatusFilter(nextStatus);
    resetSelectionForFilterChange();
  }

  function handleDeliveryStatusFilterChange(nextStatus: DeliveryStatusFilter) {
    setDeliveryStatusFilter(nextStatus);
    resetSelectionForFilterChange();
  }

  function handleOrderStatusChange(orderId: string, status: OrderStatus) {
    statusMutation.mutate({ orderId, status });
  }

  function handleFormSubmit(values: OrderFormValues) {
    if (!editingOrder) {
      notifications.show({
        color: 'red',
        message: t('errors.orderIdMissing'),
        title: t('notifications.updateFailed'),
      });

      return;
    }

    updateMutation.mutate({ orderId: editingOrder.id, values });
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
            onCreateStart={() => router.push('/app/orders/new')}
            onLoadMore={() => void ordersQuery.fetchNextPage()}
            onOrderSelect={handleOrderSelect}
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
          <Stack gap="md">
            {formMode === 'edit' ? (
              <OrderFormPanel
                key={`edit-${editingOrder?.id ?? 'pending'}`}
                agentContactOptions={formOptions.agentContactOptions}
                customerContactOptions={formOptions.customerContactOptions}
                isLoadingOptions={formOptionsQuery.isPending}
                isSubmitting={updateMutation.isPending}
                merchantContactOptions={formOptions.merchantContactOptions}
                mode="edit"
                onCancel={() => setFormMode('create')}
                onSubmit={handleFormSubmit}
                order={editingOrder}
                productOptions={formOptions.productOptions}
              />
            ) : null}
            <OrderDetailPanel
              error={detailQuery.error}
              isPending={detailQuery.isPending && Boolean(activeOrderId)}
              isUpdatingStatus={statusMutation.isPending}
              onEditStart={(order) => {
                setActiveOrderId(order.id);
                setFormMode('edit');
              }}
              onStatusChange={handleOrderStatusChange}
              order={detailQuery.data ?? null}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
