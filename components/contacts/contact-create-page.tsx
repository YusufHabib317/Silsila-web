'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { IconAlertTriangle, IconUsers } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import { createContact } from '@/lib/api/contacts';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ensureCsrfToken } from '@/lib/api/session-token';
import { useSessionStore } from '@/store/session';

import { ContactFormPanel, type ContactFormValues } from './contact-form-panel';
import { buildCreateContactRequest } from './contact-requests';

export function ContactCreatePage() {
  const t = useTranslations('common.contacts');
  const queryClient = useQueryClient();
  const router = useRouter();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const createMutation = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      await ensureCsrfToken();

      return createContact(buildCreateContactRequest(values));
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('notifications.createFailed'),
      });
    },
    onSuccess: (contact) => {
      queryClient.setQueryData(
        ['contact', selectedTenantId, contact.id],
        contact,
      );
      void queryClient.invalidateQueries({ queryKey: ['contacts'] });
      notifications.show({
        color: 'green',
        message: t('notifications.createSuccessMessage', {
          name: contact.displayName,
        }),
        title: t('notifications.createSuccessTitle'),
      });
      router.push('/app/contacts');
    },
  });

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
              <IconUsers size={18} />
            </ThemeIcon>
            <Title order={1} size="h2">
              {t('actions.newContact')}
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            {t('page.subtitle')}
          </Text>
        </Stack>
        <Badge color="teal" radius="sm" size="lg" variant="light">
          {t('page.badge')}
        </Badge>
      </Group>

      <ContactFormPanel
        contact={null}
        isSubmitting={createMutation.isPending}
        mode="create"
        onCancel={() => router.push('/app/contacts')}
        onSubmit={(values) => createMutation.mutate(values)}
        showCancel
      />
    </Stack>
  );
}
