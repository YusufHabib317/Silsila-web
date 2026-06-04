'use client';

import {
  Button,
  Group,
  Paper,
  Stack,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconQrcode } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export type CreateAccountValues = {
  displayName: string;
  phoneNumber: string;
};

type WhatsappAccountCreatePanelProps = {
  isSubmitting: boolean;
  onSubmit: (values: CreateAccountValues) => void;
};

export function WhatsappAccountCreatePanel({
  isSubmitting,
  onSubmit,
}: WhatsappAccountCreatePanelProps) {
  const t = useTranslations('common.whatsapp');
  const createForm = useForm<CreateAccountValues>({
    mode: 'controlled',
    initialValues: {
      displayName: '',
      phoneNumber: '',
    },
    validate: {
      displayName: (value) =>
        value.trim().length > 80 ? t('form.displayNameTooLong') : null,
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

  return (
    <Paper p="lg" radius="sm" withBorder>
      <form onSubmit={createForm.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon radius="sm" variant="light">
              <IconPlus size={18} />
            </ThemeIcon>
            <Title order={2} size="h4">
              {t('create.title')}
            </Title>
          </Group>

          <TextInput
            label={t('create.displayNameLabel')}
            placeholder={t('create.displayNamePlaceholder')}
            {...createForm.getInputProps('displayName')}
          />
          <TextInput
            label={t('create.phoneNumberLabel')}
            placeholder={t('create.phoneNumberPlaceholder')}
            {...createForm.getInputProps('phoneNumber')}
          />
          <Button
            leftSection={<IconQrcode size={18} />}
            loading={isSubmitting}
            type="submit"
          >
            {t('create.submit')}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
