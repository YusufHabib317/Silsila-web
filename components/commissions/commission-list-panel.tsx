'use client';

import {
  Button,
  Group,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { Commission } from '@/lib/api/types';

import { CommissionListContent } from './commission-list-content';
import type {
  CommissionContactOption,
  CommissionOrderOption,
  CommissionProductOption,
} from './commission-options';
import {
  COMMISSION_FILTER_ALL,
  COMMISSION_STATUS_FILTER_OPTIONS,
  COMMISSION_TYPE_FILTER_OPTIONS,
  type CommissionStatusFilter,
  type CommissionTypeFilter,
} from './commissions-ui';

type CommissionListPanelProps = {
  activeCommissionId: string | null;
  commissions: Commission[];
  contactFilter: string | null;
  contactLabels: Map<string, string>;
  contactOptions: CommissionContactOption[];
  currencyFilter: string;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isLoadingOptions: boolean;
  isPending: boolean;
  isRefetching: boolean;
  onCommissionSelect: (commissionId: string) => void;
  onContactFilterChange: (contactId: string | null) => void;
  onCreateStart: () => void;
  onCurrencyFilterChange: (currency: string) => void;
  onLoadMore: () => void;
  onOrderFilterChange: (orderId: string | null) => void;
  onProductFilterChange: (productId: string | null) => void;
  onRefresh: () => void;
  onStatusFilterChange: (status: CommissionStatusFilter) => void;
  onTypeFilterChange: (type: CommissionTypeFilter) => void;
  orderFilter: string | null;
  orderLabels: Map<string, string>;
  orderOptions: CommissionOrderOption[];
  productFilter: string | null;
  productLabels: Map<string, string>;
  productOptions: CommissionProductOption[];
  statusFilter: CommissionStatusFilter;
  typeFilter: CommissionTypeFilter;
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

export function CommissionListPanel({
  activeCommissionId,
  commissions,
  contactFilter,
  contactLabels,
  contactOptions,
  currencyFilter,
  error,
  hasNextPage,
  isFetchingNextPage,
  isLoadingOptions,
  isPending,
  isRefetching,
  onCommissionSelect,
  onContactFilterChange,
  onCreateStart,
  onCurrencyFilterChange,
  onLoadMore,
  onOrderFilterChange,
  onProductFilterChange,
  onRefresh,
  onStatusFilterChange,
  onTypeFilterChange,
  orderFilter,
  orderLabels,
  orderOptions,
  productFilter,
  productLabels,
  productOptions,
  statusFilter,
  typeFilter,
}: CommissionListPanelProps) {
  const t = useTranslations('common.commissions');
  const typeOptions = useMemo(
    () => buildSelectData(COMMISSION_TYPE_FILTER_OPTIONS, t),
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
              {t('list.loaded', { count: commissions.length })}
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
              color="teal"
              leftSection={<IconPlus size={18} />}
              onClick={onCreateStart}
            >
              {t('actions.newCommission')}
            </Button>
          </Group>
        </Group>

        <Tabs
          onChange={(value) =>
            onStatusFilterChange(
              (value as CommissionStatusFilter | null) ?? COMMISSION_FILTER_ALL,
            )
          }
          value={statusFilter}
          variant="outline"
        >
          <ScrollArea offsetScrollbars type="auto">
            <Tabs.List style={{ flexWrap: 'nowrap', minWidth: 'max-content' }}>
              {COMMISSION_STATUS_FILTER_OPTIONS.map((option) => (
                <Tabs.Tab key={option.value} value={option.value}>
                  {t(option.labelKey)}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </ScrollArea>
        </Tabs>

        <SimpleGrid cols={{ base: 1, md: 2 }}>
          <Select
            allowDeselect={false}
            data={typeOptions}
            label={t('filters.type')}
            onChange={(value) =>
              onTypeFilterChange(
                (value as CommissionTypeFilter | null) ?? COMMISSION_FILTER_ALL,
              )
            }
            value={typeFilter}
          />
          <TextInput
            label={t('filters.currency')}
            onChange={(event) =>
              onCurrencyFilterChange(event.currentTarget.value)
            }
            placeholder={t('filters.currencyPlaceholder')}
            value={currencyFilter}
          />
          <Select
            clearable
            data={contactOptions}
            disabled={isLoadingOptions}
            label={t('filters.contact')}
            onChange={onContactFilterChange}
            placeholder={t('filters.allContacts')}
            searchable
            value={contactFilter}
          />
          <Select
            clearable
            data={orderOptions}
            disabled={isLoadingOptions}
            label={t('filters.order')}
            onChange={onOrderFilterChange}
            placeholder={t('filters.allOrders')}
            searchable
            value={orderFilter}
          />
          <Select
            clearable
            data={productOptions}
            disabled={isLoadingOptions}
            label={t('filters.product')}
            onChange={onProductFilterChange}
            placeholder={t('filters.allProducts')}
            searchable
            value={productFilter}
          />
        </SimpleGrid>

        <CommissionListContent
          activeCommissionId={activeCommissionId}
          commissions={commissions}
          contactLabels={contactLabels}
          error={error}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isPending={isPending}
          onCommissionSelect={onCommissionSelect}
          onLoadMore={onLoadMore}
          orderLabels={orderLabels}
          productLabels={productLabels}
        />
      </Stack>
    </Paper>
  );
}
