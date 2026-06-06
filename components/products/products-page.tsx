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
import { IconAlertTriangle, IconPackage } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { listContacts } from '@/lib/api/contacts';
import { getApiErrorMessage } from '@/lib/api/errors';
import { getProduct, listProducts, updateProduct } from '@/lib/api/products';
import { ensureCsrfToken } from '@/lib/api/session-token';
import type { Paginated, Product } from '@/lib/api/types';
import { useSessionStore } from '@/store/session';

import { buildProductContactOptions } from './product-contact-options';
import { ProductDetailPanel } from './product-detail-panel';
import {
  ProductFormPanel,
  type ProductFormMode,
  type ProductFormValues,
} from './product-form-panel';
import { ProductListPanel } from './product-list-panel';
import {
  buildProductParams,
  buildUpdateProductRequest,
  type ProductFilters,
} from './product-requests';
import {
  PRODUCT_FILTER_ALL,
  type ProductOwnerTypeFilter,
  type ProductStatusFilter,
  type StockStatusFilter,
} from './products-ui';

type UpdateProductVariables = {
  productId: string;
  values: ProductFormValues;
};

export function ProductsPage() {
  const t = useTranslations('common.products');
  const queryClient = useQueryClient();
  const router = useRouter();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<ProductFormMode>('create');
  const [ownerTypeFilter, setOwnerTypeFilter] =
    useState<ProductOwnerTypeFilter>(PRODUCT_FILTER_ALL);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<ProductStatusFilter>(PRODUCT_FILTER_ALL);
  const [stockStatusFilter, setStockStatusFilter] =
    useState<StockStatusFilter>(PRODUCT_FILTER_ALL);
  const [debouncedSearch] = useDebouncedValue(search.trim(), 350);
  const filters = useMemo<ProductFilters>(
    () => ({
      ownerTypeFilter,
      search: debouncedSearch,
      statusFilter,
      stockStatusFilter,
    }),
    [debouncedSearch, ownerTypeFilter, statusFilter, stockStatusFilter],
  );

  const productsQuery = useInfiniteQuery<
    Paginated<Product>,
    Error,
    InfiniteData<Paginated<Product>>,
    ['products', string | null, ProductFilters],
    string | null
  >({
    enabled: Boolean(selectedTenantId),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      listProducts(buildProductParams(filters, pageParam)),
    queryKey: ['products', selectedTenantId, filters],
  });
  const detailQuery = useQuery({
    enabled: Boolean(activeProductId),
    queryFn: () => {
      if (!activeProductId) {
        throw new Error(t('errors.productIdMissing'));
      }

      return getProduct(activeProductId);
    },
    queryKey: ['product', selectedTenantId, activeProductId],
  });
  const contactOptionsQuery = useQuery({
    enabled: Boolean(selectedTenantId),
    queryFn: () => listContacts({ limit: 100 }),
    queryKey: ['productContactOptions', selectedTenantId],
  });
  const updateMutation = useMutation({
    mutationFn: async ({ productId, values }: UpdateProductVariables) => {
      await ensureCsrfToken();

      return updateProduct(productId, buildUpdateProductRequest(values));
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('notifications.updateFailed'),
      });
    },
    onSuccess: (product) => {
      queryClient.setQueryData(
        ['product', selectedTenantId, product.id],
        product,
      );
      setActiveProductId(product.id);
      setFormMode('create');
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      notifications.show({
        color: 'green',
        message: t('notifications.updateSuccessMessage', {
          name: product.name,
        }),
        title: t('notifications.updateSuccessTitle'),
      });
    },
  });
  const products = useMemo(
    () => productsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [productsQuery.data],
  );
  const contactOptions = useMemo(
    () => buildProductContactOptions(contactOptionsQuery.data),
    [contactOptionsQuery.data],
  );
  const editingProduct =
    formMode === 'edit' ? (detailQuery.data ?? null) : null;

  function resetSelectionForFilterChange() {
    setActiveProductId(null);
    setFormMode('create');
  }

  function handleProductSelect(productId: string) {
    setActiveProductId(productId);
    setFormMode('create');
  }

  function handleFormSubmit(values: ProductFormValues) {
    if (!editingProduct) {
      notifications.show({
        color: 'red',
        message: t('errors.productIdMissing'),
        title: t('notifications.updateFailed'),
      });

      return;
    }

    updateMutation.mutate({ productId: editingProduct.id, values });
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
            <ThemeIcon radius="sm" variant="light">
              <IconPackage size={18} />
            </ThemeIcon>
            <Title order={1} size="h2">
              {t('page.title')}
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            {t('page.subtitle')}
          </Text>
        </Stack>
        <Badge radius="sm" size="lg" variant="light">
          {t('page.badge')}
        </Badge>
      </Group>

      <Grid align="stretch">
        <Grid.Col span={{ base: 12, xl: 7 }}>
          <ProductListPanel
            activeProductId={activeProductId}
            error={productsQuery.error}
            hasNextPage={Boolean(productsQuery.hasNextPage)}
            isFetchingNextPage={productsQuery.isFetchingNextPage}
            isPending={productsQuery.isPending}
            isRefetching={productsQuery.isRefetching}
            onCreateStart={() => router.push('/app/products/new')}
            onLoadMore={() => void productsQuery.fetchNextPage()}
            onOwnerTypeFilterChange={(ownerType) => {
              setOwnerTypeFilter(ownerType);
              resetSelectionForFilterChange();
            }}
            onProductSelect={handleProductSelect}
            onRefresh={() => void productsQuery.refetch()}
            onSearchChange={setSearch}
            onStatusFilterChange={(status) => {
              setStatusFilter(status);
              resetSelectionForFilterChange();
            }}
            onStockStatusFilterChange={(status) => {
              setStockStatusFilter(status);
              resetSelectionForFilterChange();
            }}
            ownerTypeFilter={ownerTypeFilter}
            products={products}
            search={search}
            statusFilter={statusFilter}
            stockStatusFilter={stockStatusFilter}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, xl: 5 }}>
          <Stack gap="md">
            {formMode === 'edit' ? (
              <ProductFormPanel
                key={`edit-${editingProduct?.id ?? 'pending'}`}
                contactOptions={contactOptions}
                isLoadingContacts={contactOptionsQuery.isPending}
                isSubmitting={updateMutation.isPending}
                mode="edit"
                onCancel={() => setFormMode('create')}
                onSubmit={handleFormSubmit}
                product={editingProduct}
              />
            ) : null}
            <ProductDetailPanel
              error={detailQuery.error}
              isPending={detailQuery.isPending && Boolean(activeProductId)}
              onEditStart={(product) => {
                setActiveProductId(product.id);
                setFormMode('edit');
              }}
              product={detailQuery.data ?? null}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
