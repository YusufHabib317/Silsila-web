'use client';

import {
  Alert,
  Box,
  Button,
  Code,
  Divider,
  Group,
  Loader,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconBriefcase,
  IconEdit,
  IconReceipt,
} from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';

import { getApiErrorMessage } from '@/lib/api/errors';
import type { Order, OrderStatus } from '@/lib/api/types';

import { OrderItemsTable } from './order-items-table';
import {
  DeliveryStatusBadge,
  formatOrderAmount,
  formatOrderDate,
  ORDER_STATUS_OPTIONS,
  OrderStatusBadge,
  PaymentStatusBadge,
} from './orders-ui';

type OrderDetailPanelProps = {
  error: unknown;
  isPending: boolean;
  isUpdatingStatus: boolean;
  onEditStart: (order: Order) => void;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  order: Order | null;
};

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <Stack gap={2}>
      <Text c="dimmed" size="xs">
        {label}
      </Text>
      <Text fw={600} lineClamp={2} size="sm">
        {value}
      </Text>
    </Stack>
  );
}

function DetailCodeItem({ label, value }: DetailItemProps) {
  return (
    <Stack gap={2}>
      <Text c="dimmed" size="xs">
        {label}
      </Text>
      <Code fz="xs">{value}</Code>
    </Stack>
  );
}

function buildStatusSelectData(
  translate: (key: string) => string,
): Array<{ label: string; value: OrderStatus }> {
  return ORDER_STATUS_OPTIONS.map((option) => ({
    label: translate(option.labelKey),
    value: option.value,
  }));
}

export function OrderDetailPanel({
  error,
  isPending,
  isUpdatingStatus,
  onEditStart,
  onStatusChange,
  order,
}: OrderDetailPanelProps) {
  const locale = useLocale();
  const t = useTranslations('common.orders');
  const unavailableLabel = t('order.notAvailable');
  const statusOptions = useMemo(() => buildStatusSelectData(t), [t]);

  if (!order && !isPending && !error) {
    return (
      <Paper h="100%" p="lg" radius="sm" withBorder>
        <Stack align="center" gap="sm" justify="center" mih={320}>
          <IconBriefcase size={32} />
          <Text c="dimmed" ta="center">
            {t('detail.empty')}
          </Text>
        </Stack>
      </Paper>
    );
  }

  if (isPending) {
    return (
      <Paper h="100%" p="lg" radius="sm" withBorder>
        <Box py="xl" ta="center">
          <Loader />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper h="100%" p="lg" radius="sm" withBorder>
        <Alert color="red" icon={<IconAlertTriangle size={18} />}>
          {getApiErrorMessage(error)}
        </Alert>
      </Paper>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <Paper h="100%" p="lg" radius="sm" withBorder>
      <Stack gap="lg">
        <Group align="flex-start" justify="space-between" wrap="wrap">
          <Stack gap={4}>
            <Title order={2} size="h4">
              {order.orderNumber}
            </Title>
            <Text c="dimmed" size="sm">
              {formatOrderDate(order.createdAt, t('date.never'), locale)}
            </Text>
          </Stack>
          <Text fw={800} size="lg">
            {formatOrderAmount(
              order.totalAmountMinor,
              order.currency,
              unavailableLabel,
              locale,
            )}
          </Text>
        </Group>

        <Group justify="flex-end">
          <Button
            component={Link}
            href={`/app/commissions/new?orderId=${order.id}`}
            leftSection={<IconReceipt size={18} />}
            variant="light"
          >
            {t('actions.addCommission')}
          </Button>
          <Button
            leftSection={<IconEdit size={18} />}
            onClick={() => onEditStart(order)}
            variant="light"
          >
            {t('actions.edit')}
          </Button>
        </Group>

        <Group gap={6} wrap="wrap">
          <OrderStatusBadge
            label={t(`status.${order.status}`)}
            status={order.status}
          />
          <PaymentStatusBadge
            label={t(`paymentStatus.${order.paymentStatus}`)}
            status={order.paymentStatus}
          />
          <DeliveryStatusBadge
            label={t(`deliveryStatus.${order.deliveryStatus}`)}
            status={order.deliveryStatus}
          />
        </Group>

        <Select
          allowDeselect={false}
          data={statusOptions}
          disabled={isUpdatingStatus}
          label={t('detail.status')}
          onChange={(value) => {
            if (value && value !== order.status) {
              onStatusChange(order.id, value as OrderStatus);
            }
          }}
          value={order.status}
        />

        <Divider />

        <Stack gap="xs">
          <Text c="dimmed" size="xs">
            {t('detail.notes')}
          </Text>
          <Text style={{ whiteSpace: 'pre-wrap' }}>
            {order.notes ?? unavailableLabel}
          </Text>
        </Stack>

        <Stack gap="sm">
          <Title order={3} size="h5">
            {t('detail.lineItems')}
          </Title>
          <OrderItemsTable currency={order.currency} items={order.items} />
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <DetailItem
            label={t('detail.paymentStatus')}
            value={t(`paymentStatus.${order.paymentStatus}`)}
          />
          <DetailItem
            label={t('detail.deliveryStatus')}
            value={t(`deliveryStatus.${order.deliveryStatus}`)}
          />
          <DetailItem
            label={t('detail.updatedAt')}
            value={formatOrderDate(order.updatedAt, t('date.never'), locale)}
          />
          <DetailItem label={t('detail.currency')} value={order.currency} />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <DetailCodeItem label={t('detail.orderId')} value={order.id} />
          <DetailCodeItem
            label={t('detail.customerContactId')}
            value={order.customerContactId ?? unavailableLabel}
          />
          <DetailCodeItem
            label={t('detail.merchantContactId')}
            value={order.merchantContactId ?? unavailableLabel}
          />
          <DetailCodeItem
            label={t('detail.agentContactId')}
            value={order.agentContactId ?? unavailableLabel}
          />
          <DetailCodeItem
            label={t('detail.sourceBundleId')}
            value={order.sourceBundleId ?? unavailableLabel}
          />
          <DetailCodeItem
            label={t('detail.createdByUserId')}
            value={order.createdByUserId ?? unavailableLabel}
          />
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
