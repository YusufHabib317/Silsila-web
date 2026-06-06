'use client';

import { Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { useLocale, useTranslations } from 'next-intl';

import type { Commission } from '@/lib/api/types';

import {
  CommissionStatusBadge,
  CommissionTypeBadge,
  formatCommissionDate,
  formatCommissionValue,
} from './commissions-ui';

type CommissionRowProps = {
  commission: Commission;
  contactLabels: Map<string, string>;
  isActive: boolean;
  onSelect: (commissionId: string) => void;
  orderLabels: Map<string, string>;
  productLabels: Map<string, string>;
};

function getReferenceLabel(
  labels: Map<string, string>,
  id: string | null,
  fallbackLabel: string,
) {
  if (!id) {
    return fallbackLabel;
  }

  return labels.get(id) ?? id;
}

export function CommissionRow({
  commission,
  contactLabels,
  isActive,
  onSelect,
  orderLabels,
  productLabels,
}: CommissionRowProps) {
  const locale = useLocale();
  const t = useTranslations('common.commissions');
  const unavailableLabel = t('commission.notAvailable');
  const contactLabel =
    contactLabels.get(commission.contactId) ?? commission.contactId;
  const orderLabel = getReferenceLabel(
    orderLabels,
    commission.orderId,
    unavailableLabel,
  );
  const productLabel = getReferenceLabel(
    productLabels,
    commission.productId,
    unavailableLabel,
  );

  return (
    <UnstyledButton
      onClick={() => onSelect(commission.id)}
      style={(theme) => ({
        background: isActive ? theme.colors.teal[0] : theme.white,
        border: `1px solid ${isActive ? theme.colors.teal[4] : theme.colors.gray[3]}`,
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
              {contactLabel}
            </Text>
            <Text c="dimmed" lineClamp={1} size="xs">
              {orderLabel} / {productLabel}
            </Text>
          </Stack>
          <Stack align="flex-end" gap={1}>
            <Text fw={800} size="sm">
              {formatCommissionValue({
                amountMinor: commission.amountMinor,
                currency: commission.currency,
                fallbackLabel: unavailableLabel,
                locale,
                percentage: commission.percentage,
              })}
            </Text>
            <Text c="dimmed" size="xs" ta="end">
              {formatCommissionDate(
                commission.updatedAt,
                t('date.never'),
                locale,
              )}
            </Text>
          </Stack>
        </Group>

        <Group gap={6} justify="space-between" wrap="wrap">
          <CommissionStatusBadge
            label={t(`status.${commission.status}`)}
            status={commission.status}
          />
          <CommissionTypeBadge
            label={t(`type.${commission.commissionType}`)}
            type={commission.commissionType}
          />
        </Group>
      </Stack>
    </UnstyledButton>
  );
}
