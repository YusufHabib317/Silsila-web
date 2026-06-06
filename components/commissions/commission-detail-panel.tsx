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
import { IconAlertTriangle, IconEdit, IconReceipt } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import { getApiErrorMessage } from '@/lib/api/errors';
import type { Commission } from '@/lib/api/types';

import {
  CommissionStatusBadge,
  CommissionTypeBadge,
  formatCommissionAmount,
  formatCommissionDate,
} from './commissions-ui';

type CommissionDetailPanelProps = {
  commission: Commission | null;
  contactLabels: Map<string, string>;
  error: unknown;
  isPending: boolean;
  onEditStart: (commission: Commission) => void;
  orderLabels: Map<string, string>;
  productLabels: Map<string, string>;
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

function getReferenceLabel(
  labels: Map<string, string>,
  id: string | null,
  fallbackLabel: string,
) {
  if (!id) {
    return fallbackLabel;
  }

  return labels.get(id) ?? id;
}

export function CommissionDetailPanel({
  commission,
  contactLabels,
  error,
  isPending,
  onEditStart,
  orderLabels,
  productLabels,
}: CommissionDetailPanelProps) {
  const locale = useLocale();
  const t = useTranslations('common.commissions');
  const unavailableLabel = t('commission.notAvailable');

  if (!commission && !isPending && !error) {
    return (
      <Paper h="100%" p="lg" radius="sm" withBorder>
        <Stack align="center" gap="sm" justify="center" mih={300}>
          <IconReceipt size={32} />
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

  if (!commission) {
    return null;
  }

  const amountLabel = formatCommissionAmount(
    commission.amountMinor,
    commission.currency,
    unavailableLabel,
    locale,
  );
  const percentageLabel =
    commission.percentage === null
      ? unavailableLabel
      : `${commission.percentage.toLocaleString(locale)}%`;

  return (
    <Paper h="100%" p="lg" radius="sm" withBorder>
      <Stack gap="lg">
        <Group align="flex-start" justify="space-between" wrap="wrap">
          <Stack gap={4}>
            <Title order={2} size="h4">
              {contactLabels.get(commission.contactId) ?? commission.contactId}
            </Title>
            <Text c="dimmed" size="sm">
              {formatCommissionDate(
                commission.createdAt,
                t('date.never'),
                locale,
              )}
            </Text>
          </Stack>
          <Button
            leftSection={<IconEdit size={18} />}
            onClick={() => onEditStart(commission)}
            variant="light"
          >
            {t('actions.edit')}
          </Button>
        </Group>

        <Group gap={6} wrap="wrap">
          <CommissionStatusBadge
            label={t(`status.${commission.status}`)}
            status={commission.status}
          />
          <CommissionTypeBadge
            label={t(`type.${commission.commissionType}`)}
            type={commission.commissionType}
          />
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <DetailItem label={t('detail.amount')} value={amountLabel} />
          <DetailItem label={t('detail.percentage')} value={percentageLabel} />
          <DetailItem
            label={t('detail.currency')}
            value={commission.currency}
          />
          <DetailItem
            label={t('detail.paidAt')}
            value={formatCommissionDate(
              commission.paidAt,
              unavailableLabel,
              locale,
            )}
          />
        </SimpleGrid>

        <Divider />

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <DetailItem
            label={t('detail.contact')}
            value={
              contactLabels.get(commission.contactId) ?? commission.contactId
            }
          />
          <DetailItem
            label={t('detail.order')}
            value={getReferenceLabel(
              orderLabels,
              commission.orderId,
              unavailableLabel,
            )}
          />
          <DetailItem
            label={t('detail.product')}
            value={getReferenceLabel(
              productLabels,
              commission.productId,
              unavailableLabel,
            )}
          />
          <DetailItem
            label={t('detail.updatedAt')}
            value={formatCommissionDate(
              commission.updatedAt,
              t('date.never'),
              locale,
            )}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <DetailCodeItem
            label={t('detail.commissionId')}
            value={commission.id}
          />
          <DetailCodeItem
            label={t('detail.contactId')}
            value={commission.contactId}
          />
          <DetailCodeItem
            label={t('detail.orderId')}
            value={commission.orderId ?? unavailableLabel}
          />
          <DetailCodeItem
            label={t('detail.productId')}
            value={commission.productId ?? unavailableLabel}
          />
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
