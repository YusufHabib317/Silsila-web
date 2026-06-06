'use client';

import { Alert, Box, Button, Group, Loader, Stack } from '@mantine/core';
import { IconAlertTriangle, IconReceipt } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import { getApiErrorMessage } from '@/lib/api/errors';
import type { Commission } from '@/lib/api/types';

import { CommissionRow } from './commission-row';

type CommissionListContentProps = {
  activeCommissionId: string | null;
  commissions: Commission[];
  contactLabels: Map<string, string>;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  onCommissionSelect: (commissionId: string) => void;
  onLoadMore: () => void;
  orderLabels: Map<string, string>;
  productLabels: Map<string, string>;
};

export function CommissionListContent({
  activeCommissionId,
  commissions,
  contactLabels,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  onCommissionSelect,
  onLoadMore,
  orderLabels,
  productLabels,
}: CommissionListContentProps) {
  const t = useTranslations('common.commissions');

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

  if (commissions.length === 0) {
    return (
      <Alert color="gray" icon={<IconReceipt size={18} />}>
        {t('empty.noCommissions')}
      </Alert>
    );
  }

  return (
    <Stack gap="sm">
      {commissions.map((commission) => (
        <CommissionRow
          key={commission.id}
          commission={commission}
          contactLabels={contactLabels}
          isActive={activeCommissionId === commission.id}
          onSelect={onCommissionSelect}
          orderLabels={orderLabels}
          productLabels={productLabels}
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
