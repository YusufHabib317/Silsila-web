'use client';

import { Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { useLocale, useTranslations } from 'next-intl';

import type { Order } from '@/lib/api/types';

import {
  DeliveryStatusBadge,
  formatOrderAmount,
  formatOrderDate,
  OrderStatusBadge,
  PaymentStatusBadge,
} from './orders-ui';

type OrderRowProps = {
  isActive: boolean;
  onSelect: (orderId: string) => void;
  order: Order;
};

export function OrderRow({ isActive, onSelect, order }: OrderRowProps) {
  const locale = useLocale();
  const t = useTranslations('common.orders');
  const unavailableLabel = t('order.notAvailable');

  return (
    <UnstyledButton
      onClick={() => onSelect(order.id)}
      style={(theme) => ({
        background: isActive ? theme.colors.orange[0] : theme.white,
        border: `1px solid ${isActive ? theme.colors.orange[4] : theme.colors.gray[3]}`,
        borderRadius: theme.radius.sm,
        display: 'block',
        padding: theme.spacing.md,
        width: '100%',
      })}
    >
      <Stack gap="sm">
        <Group align="flex-start" justify="space-between" wrap="nowrap">
          <Stack gap={1} miw={0}>
            <Text fw={700} lineClamp={1} size="sm">
              {order.orderNumber}
            </Text>
            <Text c="dimmed" lineClamp={1} size="xs">
              {t('order.itemCount', { count: order.items.length })}
            </Text>
          </Stack>
          <Stack align="flex-end" gap={1}>
            <Text fw={700} size="sm">
              {formatOrderAmount(
                order.totalAmountMinor,
                order.currency,
                unavailableLabel,
                locale,
              )}
            </Text>
            <Text c="dimmed" size="xs" ta="end">
              {formatOrderDate(order.createdAt, t('date.never'), locale)}
            </Text>
          </Stack>
        </Group>

        <Group gap={6} justify="space-between" wrap="wrap">
          <Group gap={6}>
            <OrderStatusBadge
              label={t(`status.${order.status}`)}
              status={order.status}
            />
            <PaymentStatusBadge
              label={t(`paymentStatus.${order.paymentStatus}`)}
              status={order.paymentStatus}
            />
          </Group>
          <DeliveryStatusBadge
            label={t(`deliveryStatus.${order.deliveryStatus}`)}
            status={order.deliveryStatus}
          />
        </Group>
      </Stack>
    </UnstyledButton>
  );
}
