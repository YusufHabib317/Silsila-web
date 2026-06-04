'use client';

import {
  Alert,
  Box,
  Button,
  Divider,
  Group,
  Image,
  Loader,
  Modal,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconPlugOff,
  IconQrcode,
  IconRefresh,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import type { WhatsappAccount, WhatsappAccountDetail } from '@/lib/api/types';
import { getApiErrorMessage } from '@/lib/api/errors';

import {
  getAccountLabel,
  formatCountdown,
  getStatusDescriptionKey,
  StatusBadge,
} from './whatsapp-ui';

type WhatsappConnectionModalProps = {
  account: WhatsappAccountDetail | null;
  error: unknown;
  fallbackAccount: WhatsappAccount | null;
  isFetching: boolean;
  isPending: boolean;
  onClose: () => void;
  onDisconnect: (account: WhatsappAccountDetail) => void;
  onRefresh: () => void;
  opened: boolean;
  qrDataUrl: string | null;
  qrError: string | null;
};

type ConnectionContentProps = Omit<
  WhatsappConnectionModalProps,
  'fallbackAccount' | 'onClose'
>;

function ConnectionContent({
  account,
  error,
  isFetching,
  isPending,
  onDisconnect,
  onRefresh,
  opened,
  qrDataUrl,
  qrError,
}: ConnectionContentProps) {
  const t = useTranslations('common.whatsapp');
  const [now, setNow] = useState(() => Date.now());
  const qrCountdown = formatCountdown(account?.qrExpiresAt ?? null, now);

  useEffect(() => {
    if (!opened) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1_000);

    return () => window.clearInterval(intervalId);
  }, [opened]);

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

  if (!account) {
    return null;
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" wrap="wrap">
        <Stack gap={2}>
          <StatusBadge
            label={t(`status.${account.status}`)}
            status={account.status}
          />
          <Text c="dimmed" size="sm">
            {t(getStatusDescriptionKey(account.status))}
          </Text>
        </Stack>
        {account.status === 'connected' ? (
          <ThemeIcon color="green" radius="sm" size="xl" variant="light">
            <IconCircleCheck size={24} />
          </ThemeIcon>
        ) : null}
      </Group>

      <Divider />

      {qrError ? (
        <Alert color="red" icon={<IconAlertTriangle size={18} />}>
          {qrError}
        </Alert>
      ) : null}

      {qrDataUrl ? (
        <Stack align="center" gap="md">
          <Image
            alt={t('connection.qrAlt')}
            fit="contain"
            h={260}
            radius="sm"
            src={qrDataUrl}
            w={260}
          />
          {qrCountdown ? (
            <StatusBadge label={t('status.qr_ready')} status="qr_ready" />
          ) : null}
          {qrCountdown ? (
            <Text c="dimmed" size="sm">
              {t('connection.expiresIn', { time: qrCountdown })}
            </Text>
          ) : null}
        </Stack>
      ) : (
        <Alert color="yellow" icon={<IconQrcode size={18} />}>
          {t('connection.qrUnavailable')}
        </Alert>
      )}

      <Group justify="space-between" wrap="wrap">
        <Button
          leftSection={<IconRefresh size={18} />}
          loading={isFetching}
          onClick={onRefresh}
          variant="light"
        >
          {t('actions.refreshStatus')}
        </Button>
        <Button
          color="red"
          disabled={
            account.status === 'disconnected' || account.status === 'disabled'
          }
          leftSection={<IconPlugOff size={18} />}
          onClick={() => onDisconnect(account)}
          variant="subtle"
        >
          {t('actions.disconnect')}
        </Button>
      </Group>
    </Stack>
  );
}

export function WhatsappConnectionModal({
  account,
  error,
  fallbackAccount,
  isFetching,
  isPending,
  onClose,
  onDisconnect,
  onRefresh,
  opened,
  qrDataUrl,
  qrError,
}: WhatsappConnectionModalProps) {
  const t = useTranslations('common.whatsapp');
  const modalAccount = account ?? fallbackAccount;

  return (
    <Modal
      onClose={onClose}
      opened={opened}
      size="lg"
      title={
        modalAccount
          ? getAccountLabel(modalAccount, t('account.unnamed'))
          : t('connection.title')
      }
    >
      <ConnectionContent
        account={account}
        error={error}
        isFetching={isFetching}
        isPending={isPending}
        onDisconnect={onDisconnect}
        onRefresh={onRefresh}
        opened={opened}
        qrDataUrl={qrDataUrl}
        qrError={qrError}
      />
    </Modal>
  );
}
