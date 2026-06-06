'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Group,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconReceipt } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { createCommission } from '@/lib/api/commissions';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ensureCsrfToken } from '@/lib/api/session-token';
import { useSessionStore } from '@/store/session';

import { listCommissionFormOptions } from './commission-form-options';
import { CommissionFormPanel } from './commission-form-panel';
import type { CommissionFormValues } from './commission-form-types';
import { buildCreateCommissionRequest } from './commission-requests';

const EMPTY_OPTIONS = {
  contactOptions: [],
  orderOptions: [],
  productOptions: [],
};

function cleanQueryId(value: string | null) {
  const trimmedValue = value?.trim();

  return trimmedValue || null;
}

type CommissionCreatePageProps = {
  initialOrderId?: string | null;
  initialProductId?: string | null;
};

export function CommissionCreatePage({
  initialOrderId = null,
  initialProductId = null,
}: CommissionCreatePageProps) {
  const t = useTranslations('common.commissions');
  const queryClient = useQueryClient();
  const router = useRouter();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const cleanInitialOrderId = cleanQueryId(initialOrderId);
  const cleanInitialProductId = cleanQueryId(initialProductId);
  const formOptionsQuery = useQuery({
    enabled: Boolean(selectedTenantId),
    queryFn: listCommissionFormOptions,
    queryKey: ['commissionFormOptions', selectedTenantId],
  });
  const createMutation = useMutation({
    mutationFn: async (values: CommissionFormValues) => {
      await ensureCsrfToken();

      return createCommission(buildCreateCommissionRequest(values));
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('notifications.createFailed'),
      });
    },
    onSuccess: (commission) => {
      queryClient.setQueryData(
        ['commission', selectedTenantId, commission.id],
        commission,
      );
      void queryClient.invalidateQueries({ queryKey: ['commissions'] });
      notifications.show({
        color: 'green',
        message: t('notifications.createSuccessMessage'),
        title: t('notifications.createSuccessTitle'),
      });
      router.push('/app/commissions');
    },
  });
  const options = formOptionsQuery.data ?? EMPTY_OPTIONS;

  if (!selectedTenantId) {
    return (
      <Alert color="yellow" icon={<IconAlertTriangle size={18} />}>
        {t('empty.selectTenant')}
      </Alert>
    );
  }

  return (
    <Stack gap="xl" maw={880}>
      <Group align="flex-start" justify="space-between">
        <Stack gap={4}>
          <Group gap="sm">
            <ThemeIcon color="teal" radius="sm" variant="light">
              <IconReceipt size={18} />
            </ThemeIcon>
            <Title order={1} size="h2">
              {t('createPage.title')}
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            {t('createPage.subtitle')}
          </Text>
        </Stack>
        <Badge color="teal" radius="sm" size="lg" variant="light">
          {t('page.badge')}
        </Badge>
      </Group>

      <CommissionFormPanel
        commission={null}
        contactOptions={options.contactOptions}
        initialOrderId={cleanInitialOrderId}
        initialProductId={cleanInitialProductId}
        isLoadingOptions={formOptionsQuery.isPending}
        isSubmitting={createMutation.isPending}
        mode="create"
        onCancel={() => router.push('/app/commissions')}
        onSubmit={(values) => createMutation.mutate(values)}
        orderOptions={options.orderOptions}
        productOptions={options.productOptions}
        showCancel
      />
    </Stack>
  );
}
