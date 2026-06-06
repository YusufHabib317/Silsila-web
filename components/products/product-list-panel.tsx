'use client';

import {
  Alert,
  Box,
  Button,
  Group,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconPackage,
  IconPlus,
  IconRefresh,
  IconSearch,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { getApiErrorMessage } from '@/lib/api/errors';
import type { Product } from '@/lib/api/types';

import { ProductRow } from './product-row';
import {
  PRODUCT_FILTER_ALL,
  PRODUCT_OWNER_TYPE_FILTER_OPTIONS,
  type ProductOwnerTypeFilter,
  PRODUCT_STATUS_FILTER_OPTIONS,
  type ProductStatusFilter,
  STOCK_STATUS_FILTER_OPTIONS,
  type StockStatusFilter,
} from './products-ui';

type ProductListPanelProps = {
  activeProductId: string | null;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  isRefetching: boolean;
  onLoadMore: () => void;
  onOwnerTypeFilterChange: (ownerType: ProductOwnerTypeFilter) => void;
  onProductSelect: (productId: string) => void;
  onRefresh: () => void;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: ProductStatusFilter) => void;
  onStockStatusFilterChange: (status: StockStatusFilter) => void;
  onCreateStart: () => void;
  ownerTypeFilter: ProductOwnerTypeFilter;
  products: Product[];
  search: string;
  statusFilter: ProductStatusFilter;
  stockStatusFilter: StockStatusFilter;
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

function ProductListContent({
  activeProductId,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  onLoadMore,
  onProductSelect,
  products,
}: Pick<
  ProductListPanelProps,
  | 'activeProductId'
  | 'error'
  | 'hasNextPage'
  | 'isFetchingNextPage'
  | 'isPending'
  | 'onLoadMore'
  | 'onProductSelect'
  | 'products'
>) {
  const t = useTranslations('common.products');

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

  if (products.length === 0) {
    return (
      <Alert color="gray" icon={<IconPackage size={18} />}>
        {t('empty.noProducts')}
      </Alert>
    );
  }

  return (
    <Stack gap="sm">
      {products.map((product) => (
        <ProductRow
          key={product.id}
          isActive={activeProductId === product.id}
          onSelect={onProductSelect}
          product={product}
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

export function ProductListPanel({
  activeProductId,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  isRefetching,
  onCreateStart,
  onLoadMore,
  onOwnerTypeFilterChange,
  onProductSelect,
  onRefresh,
  onSearchChange,
  onStatusFilterChange,
  onStockStatusFilterChange,
  ownerTypeFilter,
  products,
  search,
  statusFilter,
  stockStatusFilter,
}: ProductListPanelProps) {
  const t = useTranslations('common.products');
  const statusOptions = useMemo(
    () => buildSelectData(PRODUCT_STATUS_FILTER_OPTIONS, t),
    [t],
  );
  const stockOptions = useMemo(
    () => buildSelectData(STOCK_STATUS_FILTER_OPTIONS, t),
    [t],
  );
  const ownerTypeOptions = useMemo(
    () => buildSelectData(PRODUCT_OWNER_TYPE_FILTER_OPTIONS, t),
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
              {t('list.loaded', { count: products.length })}
            </Text>
          </Stack>
          <Group gap="xs">
            <Button
              leftSection={<IconRefresh size={18} />}
              loading={isRefetching}
              onClick={onRefresh}
              variant="light"
            >
              {t('actions.refresh')}
            </Button>
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={onCreateStart}
            >
              {t('actions.newProduct')}
            </Button>
          </Group>
        </Group>

        <Group align="flex-end" gap="sm" wrap="wrap">
          <Select
            allowDeselect={false}
            data={statusOptions}
            label={t('filters.productStatus')}
            onChange={(value) =>
              onStatusFilterChange(
                (value as ProductStatusFilter | null) ?? PRODUCT_FILTER_ALL,
              )
            }
            value={statusFilter}
            w={{ base: '100%', sm: 220 }}
          />
          <Select
            allowDeselect={false}
            data={stockOptions}
            label={t('filters.stockStatus')}
            onChange={(value) =>
              onStockStatusFilterChange(
                (value as StockStatusFilter | null) ?? PRODUCT_FILTER_ALL,
              )
            }
            value={stockStatusFilter}
            w={{ base: '100%', sm: 220 }}
          />
          <Select
            allowDeselect={false}
            data={ownerTypeOptions}
            label={t('filters.ownerType')}
            onChange={(value) =>
              onOwnerTypeFilterChange(
                (value as ProductOwnerTypeFilter | null) ?? PRODUCT_FILTER_ALL,
              )
            }
            value={ownerTypeFilter}
            w={{ base: '100%', sm: 220 }}
          />
          <TextInput
            label={t('filters.search')}
            leftSection={<IconSearch size={16} />}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            placeholder={t('filters.searchPlaceholder')}
            value={search}
            w={{ base: '100%', sm: 300 }}
          />
        </Group>

        <ProductListContent
          activeProductId={activeProductId}
          error={error}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isPending={isPending}
          onLoadMore={onLoadMore}
          onProductSelect={onProductSelect}
          products={products}
        />
      </Stack>
    </Paper>
  );
}
