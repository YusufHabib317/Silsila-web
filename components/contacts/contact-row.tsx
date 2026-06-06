'use client';

import { Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconPhone } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import type { Contact } from '@/lib/api/types';

import { ContactRoleBadge, formatContactDate } from './contacts-ui';

type ContactRowProps = {
  contact: Contact;
  isActive: boolean;
  onSelect: (contactId: string) => void;
};

export function ContactRow({ contact, isActive, onSelect }: ContactRowProps) {
  const locale = useLocale();
  const t = useTranslations('common.contacts');
  const primaryRoles = contact.roles.slice(0, 3);
  const remainingRoleCount = contact.roles.length - primaryRoles.length;

  return (
    <UnstyledButton
      onClick={() => onSelect(contact.id)}
      style={(theme) => ({
        background: isActive ? theme.colors.teal[0] : theme.white,
        border: `1px solid ${isActive ? theme.colors.teal[4] : theme.colors.gray[3]}`,
        borderRadius: theme.radius.sm,
        display: 'block',
        padding: theme.spacing.md,
        width: '100%',
      })}
    >
      <Stack gap="sm">
        <Group align="flex-start" justify="space-between" wrap="nowrap">
          <Stack gap={2} miw={0}>
            <Text fw={700} lineClamp={1} size="sm">
              {contact.displayName}
            </Text>
            <Group c="dimmed" gap={4} wrap="nowrap">
              <IconPhone size={14} />
              <Text lineClamp={1} size="xs">
                {contact.phoneNumber ?? t('contact.noPhone')}
              </Text>
            </Group>
          </Stack>
          <Text c="dimmed" size="xs" ta="end">
            {formatContactDate(contact.updatedAt, t('date.never'), locale)}
          </Text>
        </Group>

        <Group gap={6} wrap="wrap">
          {primaryRoles.length > 0 ? (
            primaryRoles.map((assignment) => (
              <ContactRoleBadge
                key={assignment.id}
                label={t(`role.${assignment.role}`)}
                role={assignment.role}
              />
            ))
          ) : (
            <ContactRoleBadge label={t('role.unknown')} role="unknown" />
          )}
          {remainingRoleCount > 0 ? (
            <Text c="dimmed" size="xs">
              {t('contact.moreRoles', { count: remainingRoleCount })}
            </Text>
          ) : null}
        </Group>
      </Stack>
    </UnstyledButton>
  );
}
