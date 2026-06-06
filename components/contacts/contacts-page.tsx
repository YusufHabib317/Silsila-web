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
import { IconAlertTriangle, IconUsers } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import {
  createContact,
  getContact,
  listContacts,
  updateContact,
} from '@/lib/api/contacts';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ensureCsrfToken } from '@/lib/api/session-token';
import type { Contact, Paginated } from '@/lib/api/types';
import { useSessionStore } from '@/store/session';

import { ContactDetailPanel } from './contact-detail-panel';
import {
  ContactFormPanel,
  type ContactFormMode,
  type ContactFormValues,
} from './contact-form-panel';
import { ContactListPanel } from './contact-list-panel';
import {
  buildContactParams,
  buildCreateContactRequest,
  buildUpdateContactRequest,
  type ContactFilters,
} from './contact-requests';
import { CONTACT_FILTER_ALL, type ContactRoleFilter } from './contacts-ui';

type UpdateContactVariables = {
  contactId: string;
  values: ContactFormValues;
};

export function ContactsPage() {
  const t = useTranslations('common.contacts');
  const queryClient = useQueryClient();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<ContactFormMode>('create');
  const [roleFilter, setRoleFilter] =
    useState<ContactRoleFilter>(CONTACT_FILTER_ALL);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search.trim(), 350);
  const filters = useMemo<ContactFilters>(
    () => ({ roleFilter, search: debouncedSearch }),
    [debouncedSearch, roleFilter],
  );

  const contactsQuery = useInfiniteQuery<
    Paginated<Contact>,
    Error,
    InfiniteData<Paginated<Contact>>,
    ['contacts', string | null, ContactFilters],
    string | null
  >({
    enabled: Boolean(selectedTenantId),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      listContacts(buildContactParams(filters, pageParam)),
    queryKey: ['contacts', selectedTenantId, filters],
  });
  const detailQuery = useQuery({
    enabled: Boolean(activeContactId),
    queryFn: () => {
      if (!activeContactId) {
        throw new Error(t('errors.contactIdMissing'));
      }

      return getContact(activeContactId);
    },
    queryKey: ['contact', selectedTenantId, activeContactId],
  });
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
      setActiveContactId(contact.id);
      setFormMode('create');
      void queryClient.invalidateQueries({ queryKey: ['contacts'] });
      notifications.show({
        color: 'green',
        message: t('notifications.createSuccessMessage', {
          name: contact.displayName,
        }),
        title: t('notifications.createSuccessTitle'),
      });
    },
  });
  const updateMutation = useMutation({
    mutationFn: async ({ contactId, values }: UpdateContactVariables) => {
      await ensureCsrfToken();

      return updateContact(contactId, buildUpdateContactRequest(values));
    },
    onError: (error) => {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('notifications.updateFailed'),
      });
    },
    onSuccess: (contact) => {
      queryClient.setQueryData(
        ['contact', selectedTenantId, contact.id],
        contact,
      );
      setActiveContactId(contact.id);
      setFormMode('create');
      void queryClient.invalidateQueries({ queryKey: ['contacts'] });
      notifications.show({
        color: 'green',
        message: t('notifications.updateSuccessMessage', {
          name: contact.displayName,
        }),
        title: t('notifications.updateSuccessTitle'),
      });
    },
  });
  const contacts = useMemo(
    () => contactsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [contactsQuery.data],
  );
  const editingContact =
    formMode === 'edit' ? (detailQuery.data ?? null) : null;

  function handleRoleFilterChange(nextRole: ContactRoleFilter) {
    setRoleFilter(nextRole);
    setActiveContactId(null);
    setFormMode('create');
  }

  function handleContactSelect(contactId: string) {
    setActiveContactId(contactId);
    setFormMode('create');
  }

  function handleFormSubmit(values: ContactFormValues) {
    if (formMode === 'edit') {
      if (!editingContact) {
        notifications.show({
          color: 'red',
          message: t('errors.contactIdMissing'),
          title: t('notifications.updateFailed'),
        });

        return;
      }

      updateMutation.mutate({ contactId: editingContact.id, values });
      return;
    }

    createMutation.mutate(values);
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
            <ThemeIcon color="teal" radius="sm" variant="light">
              <IconUsers size={18} />
            </ThemeIcon>
            <Title order={1} size="h2">
              {t('page.title')}
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

      <Grid align="stretch">
        <Grid.Col span={{ base: 12, xl: 7 }}>
          <ContactListPanel
            activeContactId={activeContactId}
            contacts={contacts}
            error={contactsQuery.error}
            hasNextPage={Boolean(contactsQuery.hasNextPage)}
            isFetchingNextPage={contactsQuery.isFetchingNextPage}
            isPending={contactsQuery.isPending}
            isRefetching={contactsQuery.isRefetching}
            onContactSelect={handleContactSelect}
            onCreateStart={() => {
              setActiveContactId(null);
              setFormMode('create');
            }}
            onLoadMore={() => void contactsQuery.fetchNextPage()}
            onRefresh={() => void contactsQuery.refetch()}
            onRoleFilterChange={handleRoleFilterChange}
            onSearchChange={setSearch}
            roleFilter={roleFilter}
            search={search}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, xl: 5 }}>
          <Stack gap="md">
            <ContactFormPanel
              key={
                formMode === 'edit'
                  ? `edit-${editingContact?.id ?? 'pending'}`
                  : 'create'
              }
              contact={editingContact}
              isSubmitting={
                formMode === 'edit'
                  ? updateMutation.isPending
                  : createMutation.isPending
              }
              mode={formMode}
              onCancel={() => setFormMode('create')}
              onSubmit={handleFormSubmit}
            />
            <ContactDetailPanel
              contact={detailQuery.data ?? null}
              error={detailQuery.error}
              isPending={detailQuery.isPending && Boolean(activeContactId)}
              onEditStart={(contact) => {
                setActiveContactId(contact.id);
                setFormMode('edit');
              }}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
