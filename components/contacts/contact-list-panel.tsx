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
  IconRefresh,
  IconSearch,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { getApiErrorMessage } from '@/lib/api/errors';
import type { Contact } from '@/lib/api/types';

import { ContactRow } from './contact-row';
import {
  CONTACT_FILTER_ALL,
  type ContactRoleFilter,
  CONTACT_ROLE_FILTER_OPTIONS,
} from './contacts-ui';

type ContactListPanelProps = {
  activeContactId: string | null;
  contacts: Contact[];
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isPending: boolean;
  isRefetching: boolean;
  onContactSelect: (contactId: string) => void;
  onCreateStart: () => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  onRoleFilterChange: (role: ContactRoleFilter) => void;
  onSearchChange: (search: string) => void;
  roleFilter: ContactRoleFilter;
  search: string;
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

function ContactListContent({
  activeContactId,
  contacts,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  onContactSelect,
  onLoadMore,
}: Pick<
  ContactListPanelProps,
  | 'activeContactId'
  | 'contacts'
  | 'error'
  | 'hasNextPage'
  | 'isFetchingNextPage'
  | 'isPending'
  | 'onContactSelect'
  | 'onLoadMore'
>) {
  const t = useTranslations('common.contacts');

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

  if (contacts.length === 0) {
    return (
      <Alert color="gray" icon={<IconUsers size={18} />}>
        {t('empty.noContacts')}
      </Alert>
    );
  }

  return (
    <Stack gap="sm">
      {contacts.map((contact) => (
        <ContactRow
          key={contact.id}
          contact={contact}
          isActive={activeContactId === contact.id}
          onSelect={onContactSelect}
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

export function ContactListPanel({
  activeContactId,
  contacts,
  error,
  hasNextPage,
  isFetchingNextPage,
  isPending,
  isRefetching,
  onContactSelect,
  onCreateStart,
  onLoadMore,
  onRefresh,
  onRoleFilterChange,
  onSearchChange,
  roleFilter,
  search,
}: ContactListPanelProps) {
  const t = useTranslations('common.contacts');
  const roleOptions = useMemo(
    () => buildSelectData(CONTACT_ROLE_FILTER_OPTIONS, t),
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
              {t('list.loaded', { count: contacts.length })}
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
              leftSection={<IconUserPlus size={18} />}
              onClick={onCreateStart}
            >
              {t('actions.newContact')}
            </Button>
          </Group>
        </Group>

        <Group align="flex-end" gap="sm" wrap="wrap">
          <Select
            allowDeselect={false}
            data={roleOptions}
            label={t('filters.role')}
            onChange={(value) =>
              onRoleFilterChange(
                (value as ContactRoleFilter | null) ?? CONTACT_FILTER_ALL,
              )
            }
            value={roleFilter}
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

        <ContactListContent
          activeContactId={activeContactId}
          contacts={contacts}
          error={error}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          isPending={isPending}
          onContactSelect={onContactSelect}
          onLoadMore={onLoadMore}
        />
      </Stack>
    </Paper>
  );
}
