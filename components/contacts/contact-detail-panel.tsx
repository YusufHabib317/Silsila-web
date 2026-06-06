'use client';

import {
  Alert,
  Box,
  Button,
  Code,
  Divider,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconEdit,
  IconPhone,
  IconUsers,
} from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import { getApiErrorMessage } from '@/lib/api/errors';
import type { Contact } from '@/lib/api/types';

import { ContactRoleBadge, formatContactDate } from './contacts-ui';

type ContactDetailPanelProps = {
  contact: Contact | null;
  error: unknown;
  isPending: boolean;
  onEditStart: (contact: Contact) => void;
};

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <Stack gap={2}>
      <Text c="dimmed" size="xs">
        {label}
      </Text>
      <Text fw={600} lineClamp={2} size="sm">
        {value}
      </Text>
    </Stack>
  );
}

function DetailCodeItem({ label, value }: DetailItemProps) {
  return (
    <Stack gap={2}>
      <Text c="dimmed" size="xs">
        {label}
      </Text>
      <Code fz="xs">{value}</Code>
    </Stack>
  );
}

export function ContactDetailPanel({
  contact,
  error,
  isPending,
  onEditStart,
}: ContactDetailPanelProps) {
  const locale = useLocale();
  const t = useTranslations('common.contacts');
  const unavailableLabel = t('contact.notAvailable');

  if (!contact && !isPending && !error) {
    return (
      <Paper h="100%" p="lg" radius="sm" withBorder>
        <Stack align="center" gap="sm" justify="center" mih={260}>
          <IconUsers size={32} />
          <Text c="dimmed" ta="center">
            {t('detail.empty')}
          </Text>
        </Stack>
      </Paper>
    );
  }

  if (isPending) {
    return (
      <Paper h="100%" p="lg" radius="sm" withBorder>
        <Box py="xl" ta="center">
          <Loader />
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper h="100%" p="lg" radius="sm" withBorder>
        <Alert color="red" icon={<IconAlertTriangle size={18} />}>
          {getApiErrorMessage(error)}
        </Alert>
      </Paper>
    );
  }

  if (!contact) {
    return null;
  }

  return (
    <Paper h="100%" p="lg" radius="sm" withBorder>
      <Stack gap="lg">
        <Group align="flex-start" justify="space-between" wrap="wrap">
          <Stack gap={4}>
            <Title order={2} size="h4">
              {contact.displayName}
            </Title>
            <Group c="dimmed" gap={4}>
              <IconPhone size={16} />
              <Text size="sm">
                {contact.phoneNumber ?? t('contact.noPhone')}
              </Text>
            </Group>
          </Stack>
          <Button
            leftSection={<IconEdit size={18} />}
            onClick={() => onEditStart(contact)}
            variant="light"
          >
            {t('actions.edit')}
          </Button>
        </Group>

        <Group gap={6} wrap="wrap">
          {contact.roles.length > 0 ? (
            contact.roles.map((assignment) => (
              <ContactRoleBadge
                key={assignment.id}
                label={t(`role.${assignment.role}`)}
                role={assignment.role}
              />
            ))
          ) : (
            <ContactRoleBadge label={t('role.unknown')} role="unknown" />
          )}
        </Group>

        <Divider />

        <Stack gap="xs">
          <Text c="dimmed" size="xs">
            {t('detail.notes')}
          </Text>
          <Text style={{ whiteSpace: 'pre-wrap' }}>
            {contact.notes ?? unavailableLabel}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <DetailItem
            label={t('detail.createdAt')}
            value={formatContactDate(
              contact.createdAt,
              t('date.never'),
              locale,
            )}
          />
          <DetailItem
            label={t('detail.updatedAt')}
            value={formatContactDate(
              contact.updatedAt,
              t('date.never'),
              locale,
            )}
          />
        </SimpleGrid>

        <Stack gap="sm">
          <Title order={3} size="h5">
            {t('detail.roleContexts')}
          </Title>
          {contact.roles.length > 0 ? (
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              {contact.roles.map((assignment) => (
                <Stack key={assignment.id} gap={4}>
                  <ContactRoleBadge
                    label={t(`role.${assignment.role}`)}
                    role={assignment.role}
                  />
                  <Text c="dimmed" size="xs">
                    {assignment.contextType ?? t('detail.globalRole')}
                  </Text>
                  {assignment.contextId ? (
                    <Code fz="xs">{assignment.contextId}</Code>
                  ) : null}
                </Stack>
              ))}
            </SimpleGrid>
          ) : (
            <Text c="dimmed" size="sm">
              {t('detail.noRoleContexts')}
            </Text>
          )}
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <DetailCodeItem label={t('detail.contactId')} value={contact.id} />
          <DetailCodeItem
            label={t('detail.phoneNumber')}
            value={contact.phoneNumber ?? unavailableLabel}
          />
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
