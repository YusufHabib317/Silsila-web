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
import { IconAlertTriangle, IconBriefcase } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { getApiErrorMessage } from '@/lib/api/errors';
import { createOrder } from '@/lib/api/orders';
import { ensureCsrfToken } from '@/lib/api/session-token';
import { useSessionStore } from '@/store/session';

import { listOrderFormOptions } from './order-form-options';
import { OrderFormPanel, type OrderFormValues } from './order-form-panel';
import { buildCreateOrderRequest } from './order-requests';

const EMPTY_OPTIONS = {
  agentContactOptions: [],
  customerContactOptions: [],
  merchantContactOptions: [],
  productOptions: [],
};

export function OrderCreatePage() {
  const t = useTranslations('common.orders');
  const queryClient = useQueryClient();
  const router = useRouter();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const formOptionsQuery = useQuery({
    enabled: Boolean(selectedTenantId),
    queryFn: listOrderFormOptions,
    queryKey: ['orderFormOptions', selectedTenantId],
  });
  const createMutation = useMutation({
    mutationFn: async (values: OrderFormValues) => {
      await ensureCsrfToken();

      return createOrder(buildCreateOrderRequest(values));
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('notifications.createFailed'),
      });
    },
    onSuccess: (order) => {
      queryClient.setQueryData(['order', selectedTenantId, order.id], order);
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
      notifications.show({
        color: 'green',
        message: t('notifications.createSuccessMessage', {
          orderNumber: order.orderNumber,
        }),
        title: t('notifications.createSuccessTitle'),
      });
      router.push('/app/orders');
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
    <Stack gap="xl" maw={980}>
      <Group align="flex-start" justify="space-between">
        <Stack gap={4}>
          <Group gap="sm">
            <ThemeIcon color="orange" radius="sm" variant="light">
              <IconBriefcase size={18} />
            </ThemeIcon>
            <Title order={1} size="h2">
              {t('createPage.title')}
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            {t('createPage.subtitle')}
          </Text>
        </Stack>
        <Badge color="orange" radius="sm" size="lg" variant="light">
          {t('page.badge')}
        </Badge>
      </Group>

      <OrderFormPanel
        agentContactOptions={options.agentContactOptions}
        customerContactOptions={options.customerContactOptions}
        isLoadingOptions={formOptionsQuery.isPending}
        isSubmitting={createMutation.isPending}
        merchantContactOptions={options.merchantContactOptions}
        mode="create"
        onCancel={() => router.push('/app/orders')}
        onSubmit={(values) => createMutation.mutate(values)}
        order={null}
        productOptions={options.productOptions}
        showCancel
      />
    </Stack>
  );
}
