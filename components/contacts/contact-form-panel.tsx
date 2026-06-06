'use client';

import {
  Button,
  Group,
  MultiSelect,
  Paper,
  Stack,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconUserPlus, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { Contact, ContactRole } from '@/lib/api/types';

import { CONTACT_ROLE_OPTIONS } from './contacts-ui';

export type ContactFormMode = 'create' | 'edit';

export type ContactFormValues = {
  displayName: string;
  notes: string;
  phoneNumber: string;
  roles: ContactRole[];
};

type ContactFormPanelProps = {
  contact: Contact | null;
  isSubmitting: boolean;
  mode: ContactFormMode;
  onCancel: () => void;
  onSubmit: (values: ContactFormValues) => void;
  showCancel?: boolean;
};

function buildInitialValues(
  mode: ContactFormMode,
  contact: Contact | null,
): ContactFormValues {
  if (mode === 'edit' && contact) {
    return {
      displayName: contact.displayName,
      notes: contact.notes ?? '',
      phoneNumber: contact.phoneNumber ?? '',
      roles: contact.roles.map((assignment) => assignment.role),
    };
  }

  return {
    displayName: '',
    notes: '',
    phoneNumber: '',
    roles: [],
  };
}

export function ContactFormPanel({
  contact,
  isSubmitting,
  mode,
  onCancel,
  onSubmit,
  showCancel = false,
}: ContactFormPanelProps) {
  const t = useTranslations('common.contacts');
  const roleOptions = useMemo(
    () =>
      CONTACT_ROLE_OPTIONS.map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      })),
    [t],
  );
  const form = useForm<ContactFormValues>({
    initialValues: buildInitialValues(mode, contact),
    mode: 'controlled',
    validate: {
      displayName: (value) => {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
          return t('form.displayNameRequired');
        }

        return trimmedValue.length > 120 ? t('form.displayNameTooLong') : null;
      },
      notes: (value) =>
        value.trim().length > 1000 ? t('form.notesTooLong') : null,
      phoneNumber: (value) => {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
          return null;
        }

        return /^[+\d\s().-]{6,32}$/.test(trimmedValue)
          ? null
          : t('form.invalidPhoneNumber');
      },
    },
  });
  const isEditing = mode === 'edit';

  return (
    <Paper p="lg" radius="sm" withBorder>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon color="teal" radius="sm" variant="light">
              <IconUserPlus size={18} />
            </ThemeIcon>
            <Title order={2} size="h4">
              {isEditing ? t('form.editTitle') : t('form.createTitle')}
            </Title>
          </Group>

          <TextInput
            label={t('form.displayNameLabel')}
            placeholder={t('form.displayNamePlaceholder')}
            {...form.getInputProps('displayName')}
          />
          <TextInput
            label={t('form.phoneNumberLabel')}
            placeholder={t('form.phoneNumberPlaceholder')}
            {...form.getInputProps('phoneNumber')}
          />
          <MultiSelect
            clearable
            data={roleOptions}
            label={t('form.rolesLabel')}
            placeholder={t('form.rolesPlaceholder')}
            searchable
            {...form.getInputProps('roles')}
          />
          <Textarea
            autosize
            label={t('form.notesLabel')}
            minRows={3}
            placeholder={t('form.notesPlaceholder')}
            {...form.getInputProps('notes')}
          />

          <Group justify="flex-end">
            {isEditing || showCancel ? (
              <Button
                leftSection={<IconX size={18} />}
                onClick={onCancel}
                type="button"
                variant="subtle"
              >
                {t('actions.cancel')}
              </Button>
            ) : null}
            <Button
              leftSection={<IconCheck size={18} />}
              loading={isSubmitting}
              type="submit"
            >
              {isEditing ? t('actions.saveChanges') : t('actions.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
