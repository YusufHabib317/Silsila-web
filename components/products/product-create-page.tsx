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
import { IconAlertTriangle, IconPackage } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { listContacts } from '@/lib/api/contacts';
import { getApiErrorMessage } from '@/lib/api/errors';
import { createProduct } from '@/lib/api/products';
import { ensureCsrfToken } from '@/lib/api/session-token';
import { useSessionStore } from '@/store/session';

import { buildProductContactOptions } from './product-contact-options';
import { ProductFormPanel, type ProductFormValues } from './product-form-panel';
import { buildCreateProductRequest } from './product-requests';

export function ProductCreatePage() {
  const t = useTranslations('common.products');
  const queryClient = useQueryClient();
  const router = useRouter();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const contactOptionsQuery = useQuery({
    enabled: Boolean(selectedTenantId),
    queryFn: () => listContacts({ limit: 100 }),
    queryKey: ['productContactOptions', selectedTenantId],
  });
  const createMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      await ensureCsrfToken();

      return createProduct(buildCreateProductRequest(values));
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('notifications.createFailed'),
      });
    },
    onSuccess: (product) => {
      queryClient.setQueryData(
        ['product', selectedTenantId, product.id],
        product,
      );
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      notifications.show({
        color: 'green',
        message: t('notifications.createSuccessMessage', {
          name: product.name,
        }),
        title: t('notifications.createSuccessTitle'),
      });
      router.push('/app/products');
    },
  });
  const contactOptions = useMemo(
    () => buildProductContactOptions(contactOptionsQuery.data),
    [contactOptionsQuery.data],
  );

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
            <ThemeIcon radius="sm" variant="light">
              <IconPackage size={18} />
            </ThemeIcon>
            <Title order={1} size="h2">
              {t('createPage.title')}
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            {t('createPage.subtitle')}
          </Text>
        </Stack>
        <Badge radius="sm" size="lg" variant="light">
          {t('page.badge')}
        </Badge>
      </Group>

      <ProductFormPanel
        contactOptions={contactOptions}
        isLoadingContacts={contactOptionsQuery.isPending}
        isSubmitting={createMutation.isPending}
        mode="create"
        onCancel={() => router.push('/app/products')}
        onSubmit={(values) => createMutation.mutate(values)}
        product={null}
        showCancel
      />
    </Stack>
  );
}
