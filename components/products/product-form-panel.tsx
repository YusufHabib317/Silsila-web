'use client';

import {
  Button,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconPackage, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type {
  Product,
  ProductOwnerType,
  ProductStatus,
  StockStatus,
} from '@/lib/api/types';

import {
  PRODUCT_OWNER_TYPE_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
  STOCK_STATUS_OPTIONS,
} from './products-ui';

export type ProductFormMode = 'create' | 'edit';

export type ProductContactOption = {
  label: string;
  value: string;
};

export type ProductFormValues = {
  agentAmount: string;
  categoryId: string;
  costAmount: string;
  currency: string;
  description: string;
  merchantContactId: string | null;
  name: string;
  notes: string;
  ownerContactId: string | null;
  ownerType: ProductOwnerType;
  productStatus: ProductStatus;
  saleAmount: string;
  sourceBundleId: string;
  stockStatus: StockStatus;
};

type ProductFormPanelProps = {
  contactOptions: ProductContactOption[];
  isLoadingContacts: boolean;
  isSubmitting: boolean;
  mode: ProductFormMode;
  onCancel: () => void;
  onSubmit: (values: ProductFormValues) => void;
  product: Product | null;
  showCancel?: boolean;
};

function formatAmountInput(amountMinor: number | null) {
  if (amountMinor === null) {
    return '';
  }

  return (amountMinor / 100).toFixed(2);
}

function buildInitialValues(
  mode: ProductFormMode,
  product: Product | null,
): ProductFormValues {
  if (mode === 'edit' && product) {
    return {
      agentAmount: formatAmountInput(product.agentAmountMinor),
      categoryId: product.categoryId ?? '',
      costAmount: formatAmountInput(product.costAmountMinor),
      currency: product.currency,
      description: product.description ?? '',
      merchantContactId: product.merchantContactId,
      name: product.name,
      notes: product.notes ?? '',
      ownerContactId: product.ownerContactId,
      ownerType: product.ownerType,
      productStatus: product.productStatus,
      saleAmount: formatAmountInput(product.saleAmountMinor),
      sourceBundleId: product.sourceBundleId ?? '',
      stockStatus: product.stockStatus,
    };
  }

  return {
    agentAmount: '',
    categoryId: '',
    costAmount: '',
    currency: 'SYP',
    description: '',
    merchantContactId: null,
    name: '',
    notes: '',
    ownerContactId: null,
    ownerType: 'unknown',
    productStatus: 'draft',
    saleAmount: '',
    sourceBundleId: '',
    stockStatus: 'unknown',
  };
}

function isValidAmountInput(value: string) {
  const trimmedValue = value.trim();

  return !trimmedValue || /^\d+(\.\d{1,2})?$/.test(trimmedValue);
}

export function ProductFormPanel({
  contactOptions,
  isLoadingContacts,
  isSubmitting,
  mode,
  onCancel,
  onSubmit,
  product,
  showCancel = false,
}: ProductFormPanelProps) {
  const t = useTranslations('common.products');
  const amountPlaceholder = t('form.amountPlaceholder');
  const invalidAmountMessage = t('form.invalidAmount');
  const ownerTypeOptions = useMemo(
    () =>
      PRODUCT_OWNER_TYPE_OPTIONS.map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      })),
    [t],
  );
  const productStatusOptions = useMemo(
    () =>
      PRODUCT_STATUS_OPTIONS.map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      })),
    [t],
  );
  const stockStatusOptions = useMemo(
    () =>
      STOCK_STATUS_OPTIONS.map((option) => ({
        label: t(option.labelKey),
        value: option.value,
      })),
    [t],
  );
  const form = useForm<ProductFormValues>({
    initialValues: buildInitialValues(mode, product),
    mode: 'controlled',
    validate: {
      agentAmount: (value) =>
        isValidAmountInput(value) ? null : invalidAmountMessage,
      costAmount: (value) =>
        isValidAmountInput(value) ? null : invalidAmountMessage,
      currency: (value) =>
        /^[A-Za-z]{3}$/.test(value.trim()) ? null : t('form.invalidCurrency'),
      description: (value) =>
        value.trim().length > 2000 ? t('form.descriptionTooLong') : null,
      name: (value) => {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
          return t('form.nameRequired');
        }

        return trimmedValue.length > 160 ? t('form.nameTooLong') : null;
      },
      notes: (value) =>
        value.trim().length > 1000 ? t('form.notesTooLong') : null,
      saleAmount: (value) =>
        isValidAmountInput(value) ? null : invalidAmountMessage,
    },
  });
  const isEditing = mode === 'edit';

  return (
    <Paper p="lg" radius="sm" withBorder>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon radius="sm" variant="light">
              <IconPackage size={18} />
            </ThemeIcon>
            <Title order={2} size="h4">
              {isEditing ? t('form.editTitle') : t('form.createTitle')}
            </Title>
          </Group>

          <TextInput
            label={t('form.nameLabel')}
            placeholder={t('form.namePlaceholder')}
            {...form.getInputProps('name')}
          />

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Select
              allowDeselect={false}
              data={ownerTypeOptions}
              label={t('form.ownerTypeLabel')}
              {...form.getInputProps('ownerType')}
            />
            <Select
              allowDeselect={false}
              data={productStatusOptions}
              label={t('form.productStatusLabel')}
              {...form.getInputProps('productStatus')}
            />
            <Select
              allowDeselect={false}
              data={stockStatusOptions}
              label={t('form.stockStatusLabel')}
              {...form.getInputProps('stockStatus')}
            />
            <TextInput
              label={t('form.currencyLabel')}
              placeholder={t('form.currencyPlaceholder')}
              {...form.getInputProps('currency')}
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <Select
              clearable
              data={contactOptions}
              disabled={isLoadingContacts}
              label={t('form.ownerContactLabel')}
              placeholder={t('form.contactPlaceholder')}
              searchable
              {...form.getInputProps('ownerContactId')}
            />
            <Select
              clearable
              data={contactOptions}
              disabled={isLoadingContacts}
              label={t('form.merchantContactLabel')}
              placeholder={t('form.contactPlaceholder')}
              searchable
              {...form.getInputProps('merchantContactId')}
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            <TextInput
              label={t('form.saleAmountLabel')}
              placeholder={amountPlaceholder}
              {...form.getInputProps('saleAmount')}
            />
            <TextInput
              label={t('form.costAmountLabel')}
              placeholder={amountPlaceholder}
              {...form.getInputProps('costAmount')}
            />
            <TextInput
              label={t('form.agentAmountLabel')}
              placeholder={amountPlaceholder}
              {...form.getInputProps('agentAmount')}
            />
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            <TextInput
              label={t('form.categoryIdLabel')}
              placeholder={t('form.optionalIdPlaceholder')}
              {...form.getInputProps('categoryId')}
            />
            <TextInput
              label={t('form.sourceBundleIdLabel')}
              placeholder={t('form.optionalIdPlaceholder')}
              {...form.getInputProps('sourceBundleId')}
            />
          </SimpleGrid>

          <Textarea
            autosize
            label={t('form.descriptionLabel')}
            minRows={3}
            placeholder={t('form.descriptionPlaceholder')}
            {...form.getInputProps('description')}
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
