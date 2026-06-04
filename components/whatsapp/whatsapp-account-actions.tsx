'use client';

import { Button, Group } from '@mantine/core';
import { IconPlug, IconPlugOff, IconQrcode } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { WhatsappAccount } from '@/lib/api/types';

import {
  getPrimaryActionLabelKey,
  shouldConnectBeforeOpening,
} from './whatsapp-ui';

type WhatsappAccountActionsProps = {
  account: WhatsappAccount;
  isConnecting: boolean;
  isDisconnecting: boolean;
  onDisconnect: (account: WhatsappAccount) => void;
  onPrimaryAction: (account: WhatsappAccount) => void;
};

export function WhatsappAccountActions({
  account,
  isConnecting,
  isDisconnecting,
  onDisconnect,
  onPrimaryAction,
}: WhatsappAccountActionsProps) {
  const t = useTranslations('common.whatsapp');
  const shouldConnect = shouldConnectBeforeOpening(account.status);

  return (
    <Group gap="xs" justify="flex-end">
      <Button
        disabled={account.status === 'disabled'}
        leftSection={
          shouldConnect ? <IconPlug size={16} /> : <IconQrcode size={16} />
        }
        loading={isConnecting}
        onClick={() => onPrimaryAction(account)}
        size="xs"
        variant="light"
      >
        {t(getPrimaryActionLabelKey(account.status))}
      </Button>
      <Button
        color="red"
        disabled={
          account.status === 'disconnected' || account.status === 'disabled'
        }
        leftSection={<IconPlugOff size={16} />}
        loading={isDisconnecting}
        onClick={() => onDisconnect(account)}
        size="xs"
        variant="subtle"
      >
        {t('actions.disconnect')}
      </Button>
    </Group>
  );
}
