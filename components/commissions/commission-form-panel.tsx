'use client';

import {
  Button,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconReceipt, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type {
  Commission,
  CommissionStatus,
  CommissionType,
} from '@/lib/api/types';

import type {
  CommissionContactOption,
  CommissionOrderOption,
  CommissionProductOption,
} from './commission-options';
import {
  COMMISSION_STATUS_OPTIONS,
  COMMISSION_TYPE_OPTIONS,
} from './commissions-ui';
import {
  buildInitialCommissionFormValues,
  buildTranslatedSelectData,
  isValidCommissionDecimalInput,
  type CommissionFormMode,
  type CommissionFormValues,
} from './commission-form-types';

type CommissionFormPanelProps = {
  commission: Commission | null;
  contactOptions: CommissionContactOption[];
  initialOrderId?: string | null;
  initialProductId?: string | null;
  isLoadingOptions: boolean;
  isSubmitting: boolean;
  mode: CommissionFormMode;
  onCancel: () => void;
  onSubmit: (values: CommissionFormValues) => void;
  orderOptions: CommissionOrderOption[];
  productOptions: CommissionProductOption[];
  showCancel?: boolean;
};

export function CommissionFormPanel({
  commission,
  contactOptions,
  initialOrderId,
  initialProductId,
  isLoadingOptions,
  isSubmitting,
  mode,
  onCancel,
  onSubmit,
  orderOptions,
  productOptions,
  showCancel = false,
}: CommissionFormPanelProps) {
  const t = useTranslations('common.commissions');
  const typeOptions = useMemo(
    () => buildTranslatedSelectData(COMMISSION_TYPE_OPTIONS, t),
    [t],
  );
  const statusOptions = useMemo(
    () => buildTranslatedSelectData(COMMISSION_STATUS_OPTIONS, t),
    [t],
  );
  const form = useForm<CommissionFormValues>({
    initialValues: buildInitialCommissionFormValues({
      commission,
      initialOrderId,
      initialProductId,
      mode,
    }),
    mode: 'controlled',
    validate: {
      amount: (value, values) => {
        if (values.commissionType === 'percentage') {
          return null;
        }

        if (!value.trim()) {
          return t('form.amountRequired');
        }

        return isValidCommissionDecimalInput(value)
          ? null
          : t('form.invalidAmount');
      },
      contactId: (value) => (value ? null : t('form.contactRequired')),
      currency: (value) =>
        /^[A-Za-z]{3}$/.test(value.trim()) ? null : t('form.invalidCurrency'),
      percentage: (value, values) => {
        if (values.commissionType !== 'percentage') {
          return null;
        }

        if (!value.trim()) {
          return t('form.percentageRequired');
        }

        return isValidCommissionDecimalInput(value)
          ? null
          : t('form.invalidPercentage');
      },
    },
  });
  const isEditing = mode === 'edit';
  const isPercentage = form.values.commissionType === 'percentage';
  const isPaid = form.values.status === 'paid';

  function handleTypeChange(value: string | null) {
    if (!value) {
      return;
    }

    const commissionType = value as CommissionType;

    form.setFieldValue('commissionType', commissionType);

    if (commissionType === 'percentage') {
      form.setFieldValue('amount', '');
    } else {
      form.setFieldValue('percentage', '');
    }
  }

  function handleStatusChange(value: string | null) {
    if (!value) {
      return;
    }

    const status = value as CommissionStatus;

    form.setFieldValue('status', status);

    if (status !== 'paid') {
      form.setFieldValue('paidAt', '');
    }
  }

  function handleOrderChange(value: string | null) {
    form.setFieldValue('orderId', value);

    const selectedOrder = orderOptions.find((order) => order.value === value);

    if (selectedOrder) {
      form.setFieldValue('currency', selectedOrder.currency);
    }
  }

  function handleProductChange(value: string | null) {
    form.setFieldValue('productId', value);

    const selectedProduct = productOptions.find(
      (product) => product.value === value,
    );

    if (selectedProduct) {
      form.setFieldValue('currency', selectedProduct.currency);
    }
  }

  return (
    <Paper p="lg" radius="sm" withBorder>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon color="teal" radius="sm" variant="light">
              <IconReceipt size={18} />
            </ThemeIcon>
            <Title order={2} size="h4">
              {isEditing ? t('form.editTitle') : t('form.createTitle')}
            </Title>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Select
              clearable
              data={contactOptions}
              disabled={isLoadingOptions}
              label={t('form.contactLabel')}
              placeholder={t('form.contactPlaceholder')}
              searchable
              {...form.getInputProps('contactId')}
            />
            <Select
              allowDeselect={false}
              data={typeOptions}
              label={t('form.typeLabel')}
              onChange={handleTypeChange}
              value={form.values.commissionType}
            />
            <Select
              clearable
              data={orderOptions}
              disabled={isLoadingOptions}
              label={t('form.orderLabel')}
              onChange={handleOrderChange}
              placeholder={t('form.orderPlaceholder')}
              searchable
              value={form.values.orderId}
            />
            <Select
              clearable
              data={productOptions}
              disabled={isLoadingOptions}
              label={t('form.productLabel')}
              onChange={handleProductChange}
              placeholder={t('form.productPlaceholder')}
              searchable
              value={form.values.productId}
            />
            <Select
              allowDeselect={false}
              data={statusOptions}
              label={t('form.statusLabel')}
              onChange={handleStatusChange}
              value={form.values.status}
            />
            <TextInput
              label={t('form.currencyLabel')}
              placeholder={t('form.currencyPlaceholder')}
              {...form.getInputProps('currency')}
            />
            {isPercentage ? (
              <TextInput
                inputMode="decimal"
                label={t('form.percentageLabel')}
                placeholder={t('form.percentagePlaceholder')}
                {...form.getInputProps('percentage')}
              />
            ) : (
              <TextInput
                inputMode="decimal"
                label={t('form.amountLabel')}
                placeholder={t('form.amountPlaceholder')}
                {...form.getInputProps('amount')}
              />
            )}
            {isPaid ? (
              <TextInput
                label={t('form.paidAtLabel')}
                type="datetime-local"
                {...form.getInputProps('paidAt')}
              />
            ) : null}
          </SimpleGrid>

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
              color="teal"
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
