'use client';

import type { InfiniteData } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { Alert, Grid, Stack } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import {
  getCommission,
  listCommissions,
  updateCommission,
} from '@/lib/api/commissions';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ensureCsrfToken } from '@/lib/api/session-token';
import type { Commission, Paginated } from '@/lib/api/types';
import { useSessionStore } from '@/store/session';

import { CommissionDetailPanel } from './commission-detail-panel';
import { listCommissionFormOptions } from './commission-form-options';
import { CommissionFormPanel } from './commission-form-panel';
import type {
  CommissionFormMode,
  CommissionFormValues,
} from './commission-form-types';
import { CommissionListPanel } from './commission-list-panel';
import { buildOptionLabelMap } from './commission-options';
import { CommissionsPageHeader } from './commissions-page-header';
import {
  buildCommissionParams,
  buildUpdateCommissionRequest,
  type CommissionFilters,
} from './commission-requests';
import {
  COMMISSION_FILTER_ALL,
  type CommissionStatusFilter,
  type CommissionTypeFilter,
} from './commissions-ui';

type UpdateCommissionVariables = {
  commissionId: string;
  values: CommissionFormValues;
};

const EMPTY_OPTIONS = {
  contactOptions: [],
  orderOptions: [],
  productOptions: [],
};

export function CommissionsPage() {
  const t = useTranslations('common.commissions');
  const queryClient = useQueryClient();
  const router = useRouter();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const [activeCommissionId, setActiveCommissionId] = useState<string | null>(
    null,
  );
  const [contactFilter, setContactFilter] = useState<string | null>(null);
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [formMode, setFormMode] = useState<CommissionFormMode>('create');
  const [orderFilter, setOrderFilter] = useState<string | null>(null);
  const [productFilter, setProductFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CommissionStatusFilter>(
    COMMISSION_FILTER_ALL,
  );
  const [typeFilter, setTypeFilter] = useState<CommissionTypeFilter>(
    COMMISSION_FILTER_ALL,
  );
  const [debouncedCurrencyFilter] = useDebouncedValue(
    currencyFilter.trim(),
    350,
  );
  const filters = useMemo<CommissionFilters>(
    () => ({
      contactId: contactFilter,
      currency: debouncedCurrencyFilter,
      orderId: orderFilter,
      productId: productFilter,
      statusFilter,
      typeFilter,
    }),
    [
      contactFilter,
      debouncedCurrencyFilter,
      orderFilter,
      productFilter,
      statusFilter,
      typeFilter,
    ],
  );

  const commissionsQuery = useInfiniteQuery<
    Paginated<Commission>,
    Error,
    InfiniteData<Paginated<Commission>>,
    ['commissions', string | null, CommissionFilters],
    string | null
  >({
    enabled: Boolean(selectedTenantId),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      listCommissions(buildCommissionParams(filters, pageParam)),
    queryKey: ['commissions', selectedTenantId, filters],
  });
  const detailQuery = useQuery({
    enabled: Boolean(activeCommissionId),
    queryFn: () => {
      if (!activeCommissionId) {
        throw new Error(t('errors.commissionIdMissing'));
      }

      return getCommission(activeCommissionId);
    },
    queryKey: ['commission', selectedTenantId, activeCommissionId],
  });
  const formOptionsQuery = useQuery({
    enabled: Boolean(selectedTenantId),
    queryFn: listCommissionFormOptions,
    queryKey: ['commissionFormOptions', selectedTenantId],
  });
  const updateMutation = useMutation({
    mutationFn: async ({ commissionId, values }: UpdateCommissionVariables) => {
      await ensureCsrfToken();

      return updateCommission(
        commissionId,
        buildUpdateCommissionRequest(values),
      );
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('notifications.updateFailed'),
      });
    },
    onSuccess: (commission) => {
      queryClient.setQueryData(
        ['commission', selectedTenantId, commission.id],
        commission,
      );
      setActiveCommissionId(commission.id);
      setFormMode('create');
      void queryClient.invalidateQueries({ queryKey: ['commissions'] });
      notifications.show({
        color: 'green',
        message: t('notifications.updateSuccessMessage'),
        title: t('notifications.updateSuccessTitle'),
      });
    },
  });
  const commissions = useMemo(
    () => commissionsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [commissionsQuery.data],
  );
  const formOptions = formOptionsQuery.data ?? EMPTY_OPTIONS;
  const contactLabels = useMemo(
    () => buildOptionLabelMap(formOptions.contactOptions),
    [formOptions.contactOptions],
  );
  const orderLabels = useMemo(
    () => buildOptionLabelMap(formOptions.orderOptions),
    [formOptions.orderOptions],
  );
  const productLabels = useMemo(
    () => buildOptionLabelMap(formOptions.productOptions),
    [formOptions.productOptions],
  );
  const editingCommission =
    formMode === 'edit' ? (detailQuery.data ?? null) : null;

  function resetSelectionForFilterChange() {
    setActiveCommissionId(null);
    setFormMode('create');
  }

  function handleCommissionSelect(commissionId: string) {
    setActiveCommissionId(commissionId);
    setFormMode('create');
  }

  function handleFormSubmit(values: CommissionFormValues) {
    if (!editingCommission) {
      notifications.show({
        color: 'red',
        message: t('errors.commissionIdMissing'),
        title: t('notifications.updateFailed'),
      });

      return;
    }

    updateMutation.mutate({ commissionId: editingCommission.id, values });
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
      <CommissionsPageHeader />

      <Grid align="stretch">
        <Grid.Col span={{ base: 12, xl: 7 }}>
          <CommissionListPanel
            activeCommissionId={activeCommissionId}
            commissions={commissions}
            contactFilter={contactFilter}
            contactLabels={contactLabels}
            contactOptions={formOptions.contactOptions}
            currencyFilter={currencyFilter}
            error={commissionsQuery.error}
            hasNextPage={Boolean(commissionsQuery.hasNextPage)}
            isFetchingNextPage={commissionsQuery.isFetchingNextPage}
            isLoadingOptions={formOptionsQuery.isPending}
            isPending={commissionsQuery.isPending}
            isRefetching={commissionsQuery.isRefetching}
            onCommissionSelect={handleCommissionSelect}
            onContactFilterChange={(contactId) => {
              setContactFilter(contactId);
              resetSelectionForFilterChange();
            }}
            onCreateStart={() => router.push('/app/commissions/new')}
            onCurrencyFilterChange={(currency) => {
              setCurrencyFilter(currency);
              resetSelectionForFilterChange();
            }}
            onLoadMore={() => void commissionsQuery.fetchNextPage()}
            onOrderFilterChange={(orderId) => {
              setOrderFilter(orderId);
              resetSelectionForFilterChange();
            }}
            onProductFilterChange={(productId) => {
              setProductFilter(productId);
              resetSelectionForFilterChange();
            }}
            onRefresh={() => void commissionsQuery.refetch()}
            onStatusFilterChange={(status) => {
              setStatusFilter(status);
              resetSelectionForFilterChange();
            }}
            onTypeFilterChange={(type) => {
              setTypeFilter(type);
              resetSelectionForFilterChange();
            }}
            orderFilter={orderFilter}
            orderLabels={orderLabels}
            orderOptions={formOptions.orderOptions}
            productFilter={productFilter}
            productLabels={productLabels}
            productOptions={formOptions.productOptions}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, xl: 5 }}>
          <Stack gap="md">
            {formMode === 'edit' ? (
              <CommissionFormPanel
                key={`edit-${editingCommission?.id ?? 'pending'}`}
                commission={editingCommission}
                contactOptions={formOptions.contactOptions}
                isLoadingOptions={formOptionsQuery.isPending}
                isSubmitting={updateMutation.isPending}
                mode="edit"
                onCancel={() => setFormMode('create')}
                onSubmit={handleFormSubmit}
                orderOptions={formOptions.orderOptions}
                productOptions={formOptions.productOptions}
              />
            ) : null}
            <CommissionDetailPanel
              commission={detailQuery.data ?? null}
              contactLabels={contactLabels}
              error={detailQuery.error}
              isPending={detailQuery.isPending && Boolean(activeCommissionId)}
              onEditStart={(commission) => {
                setActiveCommissionId(commission.id);
                setFormMode('edit');
              }}
              orderLabels={orderLabels}
              productLabels={productLabels}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
