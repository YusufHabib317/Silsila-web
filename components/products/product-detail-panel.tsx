'use client';

import {
  Alert,
  Box,
  Code,
  Divider,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Button,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconEdit,
  IconPackage,
  IconReceipt,
} from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

import { getApiErrorMessage } from '@/lib/api/errors';
import type { Product } from '@/lib/api/types';

import {
  formatProductAmount,
  formatProductDate,
  ProductOwnerTypeBadge,
  ProductStatusBadge,
  StockStatusBadge,
} from './products-ui';

type ProductDetailPanelProps = {
  error: unknown;
  isPending: boolean;
  onEditStart: (product: Product) => void;
  product: Product | null;
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

export function ProductDetailPanel({
  error,
  isPending,
  onEditStart,
  product,
}: ProductDetailPanelProps) {
  const locale = useLocale();
  const t = useTranslations('common.products');
  const unavailableLabel = t('product.notAvailable');

  if (!product && !isPending && !error) {
    return (
      <Paper h="100%" p="lg" radius="sm" withBorder>
        <Stack align="center" gap="sm" justify="center" mih={260}>
          <IconPackage size={32} />
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

  if (!product) {
    return null;
  }

  return (
    <Paper h="100%" p="lg" radius="sm" withBorder>
      <Stack gap="lg">
        <Group align="flex-start" justify="space-between" wrap="wrap">
          <Stack gap={4}>
            <Title order={2} size="h4">
              {product.name}
            </Title>
            <Text c="dimmed" size="sm">
              {formatProductDate(product.createdAt, t('date.never'), locale)}
            </Text>
          </Stack>
          <Group gap="xs">
            <Button
              component={Link}
              href={`/app/commissions/new?productId=${product.id}`}
              leftSection={<IconReceipt size={18} />}
              variant="light"
            >
              {t('actions.addCommission')}
            </Button>
            <Button
              leftSection={<IconEdit size={18} />}
              onClick={() => onEditStart(product)}
              variant="light"
            >
              {t('actions.edit')}
            </Button>
          </Group>
        </Group>

        <Group gap={6} wrap="wrap">
          <ProductStatusBadge
            label={t(`status.${product.productStatus}`)}
            status={product.productStatus}
          />
          <StockStatusBadge
            label={t(`stockStatus.${product.stockStatus}`)}
            status={product.stockStatus}
          />
          <ProductOwnerTypeBadge
            label={t(`ownerType.${product.ownerType}`)}
            ownerType={product.ownerType}
          />
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          <DetailItem
            label={t('detail.saleAmount')}
            value={formatProductAmount(
              product.saleAmountMinor,
              product.currency,
              unavailableLabel,
              locale,
            )}
          />
          <DetailItem
            label={t('detail.costAmount')}
            value={formatProductAmount(
              product.costAmountMinor,
              product.currency,
              unavailableLabel,
              locale,
            )}
          />
          <DetailItem
            label={t('detail.agentAmount')}
            value={formatProductAmount(
              product.agentAmountMinor,
              product.currency,
              unavailableLabel,
              locale,
            )}
          />
        </SimpleGrid>

        <Divider />

        <Stack gap="xs">
          <Text c="dimmed" size="xs">
            {t('detail.description')}
          </Text>
          <Text style={{ whiteSpace: 'pre-wrap' }}>
            {product.description ?? unavailableLabel}
          </Text>
        </Stack>

        <Stack gap="xs">
          <Text c="dimmed" size="xs">
            {t('detail.notes')}
          </Text>
          <Text style={{ whiteSpace: 'pre-wrap' }}>
            {product.notes ?? unavailableLabel}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <DetailItem label={t('detail.currency')} value={product.currency} />
          <DetailItem
            label={t('detail.updatedAt')}
            value={formatProductDate(
              product.updatedAt,
              t('date.never'),
              locale,
            )}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <DetailCodeItem label={t('detail.productId')} value={product.id} />
          <DetailCodeItem
            label={t('detail.categoryId')}
            value={product.categoryId ?? unavailableLabel}
          />
          <DetailCodeItem
            label={t('detail.ownerContactId')}
            value={product.ownerContactId ?? unavailableLabel}
          />
          <DetailCodeItem
            label={t('detail.merchantContactId')}
            value={product.merchantContactId ?? unavailableLabel}
          />
          <DetailCodeItem
            label={t('detail.sourceBundleId')}
            value={product.sourceBundleId ?? unavailableLabel}
          />
          <DetailCodeItem
            label={t('detail.createdByUserId')}
            value={product.createdByUserId ?? unavailableLabel}
          />
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
