'use client';

import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { IconPlugOff } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { WhatsappAccount } from '@/lib/api/types';

import { getAccountLabel } from './whatsapp-ui';

type WhatsappDisconnectModalProps = {
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  target: WhatsappAccount | null;
};

export function WhatsappDisconnectModal({
  isPending,
  onCancel,
  onConfirm,
  target,
}: WhatsappDisconnectModalProps) {
  const t = useTranslations('common.whatsapp');
  const accountLabel = target
    ? getAccountLabel(target, t('account.unnamed'))
    : '';

  return (
    <Modal
      onClose={onCancel}
      opened={Boolean(target)}
      size="sm"
      title={t('disconnect.title')}
    >
      <Stack gap="md">
        <Text>{t('disconnect.confirm', { account: accountLabel })}</Text>
        <Text c="dimmed" size="sm">
          {t('disconnect.description')}
        </Text>
        <Group justify="flex-end">
          <Button disabled={isPending} onClick={onCancel} variant="subtle">
            {t('actions.cancel')}
          </Button>
          <Button
            color="red"
            leftSection={<IconPlugOff size={18} />}
            loading={isPending}
            onClick={onConfirm}
          >
            {t('actions.disconnect')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
