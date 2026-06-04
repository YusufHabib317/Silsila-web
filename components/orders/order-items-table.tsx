'use client';

import { Alert, Table, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import type { OrderLineItem } from '@/lib/api/types';

import { formatOrderAmount } from './orders-ui';

type OrderItemsTableProps = {
  currency: string;
  items: OrderLineItem[];
};

export function OrderItemsTable({ currency, items }: OrderItemsTableProps) {
  const locale = useLocale();
  const t = useTranslations('common.orders');
  const unavailableLabel = t('order.notAvailable');

  if (items.length === 0) {
    return (
      <Alert color="gray" icon={<IconInfoCircle size={18} />}>
        {t('order.noItems')}
      </Alert>
    );
  }

  return (
    <Table.ScrollContainer minWidth={640}>
      <Table highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('detail.itemTitle')}</Table.Th>
            <Table.Th ta="right">{t('detail.quantity')}</Table.Th>
            <Table.Th ta="right">{t('detail.unitAmount')}</Table.Th>
            <Table.Th ta="right">{t('detail.totalAmount')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => (
            <Table.Tr key={item.id}>
              <Table.Td>
                <Text fw={600} lineClamp={1} size="sm">
                  {item.title}
                </Text>
                {item.productId ? (
                  <Text c="dimmed" lineClamp={1} size="xs">
                    {item.productId}
                  </Text>
                ) : null}
              </Table.Td>
              <Table.Td ta="right">{item.quantity}</Table.Td>
              <Table.Td ta="right">
                {formatOrderAmount(
                  item.unitAmountMinor,
                  item.currency,
                  unavailableLabel,
                  locale,
                )}
              </Table.Td>
              <Table.Td ta="right">
                {formatOrderAmount(
                  item.totalAmountMinor,
                  currency,
                  unavailableLabel,
                  locale,
                )}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
