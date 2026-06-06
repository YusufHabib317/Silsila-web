'use client';

import { Select, SimpleGrid, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { OrderContactOption } from './order-options';
import type { OrderFormValues } from './order-form-panel';
import {
  DELIVERY_STATUS_FILTER_OPTIONS,
  ORDER_FILTER_ALL,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_FILTER_OPTIONS,
} from './orders-ui';

type OrderStatusFieldsProps = {
  form: UseFormReturnType<OrderFormValues>;
};

type OrderContactFieldsProps = {
  agentContactOptions: OrderContactOption[];
  customerContactOptions: OrderContactOption[];
  form: UseFormReturnType<OrderFormValues>;
  isLoadingOptions: boolean;
  merchantContactOptions: OrderContactOption[];
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

export function OrderStatusFields({ form }: OrderStatusFieldsProps) {
  const t = useTranslations('common.orders');
  const statusOptions = useMemo(
    () => buildSelectData(ORDER_STATUS_OPTIONS, t),
    [t],
  );
  const paymentStatusOptions = useMemo(
    () =>
      buildSelectData(
        PAYMENT_STATUS_FILTER_OPTIONS.filter(
          (option) => option.value !== ORDER_FILTER_ALL,
        ),
        t,
      ),
    [t],
  );
  const deliveryStatusOptions = useMemo(
    () =>
      buildSelectData(
        DELIVERY_STATUS_FILTER_OPTIONS.filter(
          (option) => option.value !== ORDER_FILTER_ALL,
        ),
        t,
      ),
    [t],
  );

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }}>
      <TextInput
        label={t('form.orderNumberLabel')}
        placeholder={t('form.orderNumberPlaceholder')}
        {...form.getInputProps('orderNumber')}
      />
      <TextInput
        label={t('form.currencyLabel')}
        placeholder={t('form.currencyPlaceholder')}
        {...form.getInputProps('currency')}
      />
      <Select
        allowDeselect={false}
        data={statusOptions}
        label={t('form.statusLabel')}
        {...form.getInputProps('status')}
      />
      <Select
        allowDeselect={false}
        data={paymentStatusOptions}
        label={t('form.paymentStatusLabel')}
        {...form.getInputProps('paymentStatus')}
      />
      <Select
        allowDeselect={false}
        data={deliveryStatusOptions}
        label={t('form.deliveryStatusLabel')}
        {...form.getInputProps('deliveryStatus')}
      />
      <TextInput
        label={t('form.sourceBundleIdLabel')}
        placeholder={t('form.optionalIdPlaceholder')}
        {...form.getInputProps('sourceBundleId')}
      />
    </SimpleGrid>
  );
}

export function OrderContactFields({
  agentContactOptions,
  customerContactOptions,
  form,
  isLoadingOptions,
  merchantContactOptions,
}: OrderContactFieldsProps) {
  const t = useTranslations('common.orders');
  const contactPlaceholder = t('form.contactPlaceholder');

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }}>
      <Select
        clearable
        data={customerContactOptions}
        disabled={isLoadingOptions}
        label={t('form.customerContactLabel')}
        placeholder={contactPlaceholder}
        searchable
        {...form.getInputProps('customerContactId')}
      />
      <Select
        clearable
        data={merchantContactOptions}
        disabled={isLoadingOptions}
        label={t('form.merchantContactLabel')}
        placeholder={contactPlaceholder}
        searchable
        {...form.getInputProps('merchantContactId')}
      />
      <Select
        clearable
        data={agentContactOptions}
        disabled={isLoadingOptions}
        label={t('form.agentContactLabel')}
        placeholder={contactPlaceholder}
        searchable
        {...form.getInputProps('agentContactId')}
      />
    </SimpleGrid>
  );
}
