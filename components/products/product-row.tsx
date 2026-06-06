'use client';

import { Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconCurrencyDollar } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import type { Product } from '@/lib/api/types';

import {
  formatProductAmount,
  formatProductDate,
  ProductOwnerTypeBadge,
  ProductStatusBadge,
  StockStatusBadge,
} from './products-ui';

type ProductRowProps = {
  isActive: boolean;
  onSelect: (productId: string) => void;
  product: Product;
};

export function ProductRow({ isActive, onSelect, product }: ProductRowProps) {
  const locale = useLocale();
  const t = useTranslations('common.products');
  const unavailableLabel = t('product.notAvailable');

  return (
    <UnstyledButton
      onClick={() => onSelect(product.id)}
      style={(theme) => ({
        background: isActive ? theme.colors.blue[0] : theme.white,
        border: `1px solid ${isActive ? theme.colors.blue[4] : theme.colors.gray[3]}`,
        borderRadius: theme.radius.sm,
        display: 'block',
        padding: theme.spacing.md,
        width: '100%',
      })}
    >
      <Stack gap="sm">
        <Group align="flex-start" justify="space-between" wrap="nowrap">
          <Stack gap={2} miw={0}>
            <Text fw={700} lineClamp={1} size="sm">
              {product.name}
            </Text>
            <Text c="dimmed" lineClamp={1} size="xs">
              {product.description ?? t('product.noDescription')}
            </Text>
          </Stack>
          <Stack align="flex-end" gap={1}>
            <Group gap={4} wrap="nowrap">
              <IconCurrencyDollar size={14} />
              <Text fw={700} size="sm">
                {formatProductAmount(
                  product.saleAmountMinor,
                  product.currency,
                  unavailableLabel,
                  locale,
                )}
              </Text>
            </Group>
            <Text c="dimmed" size="xs" ta="end">
              {formatProductDate(product.updatedAt, t('date.never'), locale)}
            </Text>
          </Stack>
        </Group>

        <Group gap={6} justify="space-between" wrap="wrap">
          <Group gap={6}>
            <ProductStatusBadge
              label={t(`status.${product.productStatus}`)}
              status={product.productStatus}
            />
            <StockStatusBadge
              label={t(`stockStatus.${product.stockStatus}`)}
              status={product.stockStatus}
            />
          </Group>
          <ProductOwnerTypeBadge
            label={t(`ownerType.${product.ownerType}`)}
            ownerType={product.ownerType}
          />
        </Group>
      </Stack>
    </UnstyledButton>
  );
}
