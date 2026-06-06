'use client';

import {
  Button,
  Group,
  Paper,
  Stack,
  Textarea,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCheck, IconShoppingBag, IconX } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type {
  DeliveryStatus,
  Order,
  OrderStatus,
  PaymentStatus,
} from '@/lib/api/types';

import type { OrderContactOption, OrderProductOption } from './order-options';
import { OrderContactFields, OrderStatusFields } from './order-form-fields';
import { OrderLineItemsEditor } from './order-line-items-editor';

export type OrderFormMode = 'create' | 'edit';

export type OrderFormLineItem = {
  productId: string | null;
  quantity: string;
  title: string;
  unitAmount: string;
};

export type OrderFormValues = {
  agentContactId: string | null;
  currency: string;
  customerContactId: string | null;
  deliveryStatus: DeliveryStatus;
  items: OrderFormLineItem[];
  merchantContactId: string | null;
  notes: string;
  orderNumber: string;
  paymentStatus: PaymentStatus;
  sourceBundleId: string;
  status: OrderStatus;
};

type OrderFormPanelProps = {
  agentContactOptions: OrderContactOption[];
  customerContactOptions: OrderContactOption[];
  isLoadingOptions: boolean;
  isSubmitting: boolean;
  merchantContactOptions: OrderContactOption[];
  mode: OrderFormMode;
  onCancel: () => void;
  onSubmit: (values: OrderFormValues) => void;
  order: Order | null;
  productOptions: OrderProductOption[];
  showCancel?: boolean;
};

function buildDefaultOrderNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replaceAll('-', '');
  const timePart = now.toTimeString().slice(0, 8).replaceAll(':', '');

  return `ORD-${datePart}-${timePart}`;
}

function createEmptyLineItem(): OrderFormLineItem {
  return {
    productId: null,
    quantity: '1',
    title: '',
    unitAmount: '',
  };
}

function formatAmountInput(amountMinor: number | null) {
  if (amountMinor === null) {
    return '';
  }

  return (amountMinor / 100).toFixed(2);
}

function buildInitialValues(
  mode: OrderFormMode,
  order: Order | null,
): OrderFormValues {
  if (mode === 'edit' && order) {
    return {
      agentContactId: order.agentContactId,
      currency: order.currency,
      customerContactId: order.customerContactId,
      deliveryStatus: order.deliveryStatus,
      items:
        order.items.length > 0
          ? order.items.map((item) => ({
              productId: item.productId,
              quantity: String(item.quantity),
              title: item.title,
              unitAmount: formatAmountInput(item.unitAmountMinor),
            }))
          : [createEmptyLineItem()],
      merchantContactId: order.merchantContactId,
      notes: order.notes ?? '',
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      sourceBundleId: order.sourceBundleId ?? '',
      status: order.status,
    };
  }

  return {
    agentContactId: null,
    currency: 'SYP',
    customerContactId: null,
    deliveryStatus: 'unknown',
    items: [createEmptyLineItem()],
    merchantContactId: null,
    notes: '',
    orderNumber: buildDefaultOrderNumber(),
    paymentStatus: 'unknown',
    sourceBundleId: '',
    status: 'new',
  };
}

function isValidAmountInput(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return true;
  }

  return /^\d+(\.\d{1,2})?$/.test(trimmedValue);
}

function isValidQuantityInput(value: string) {
  const trimmedValue = value.trim();

  return /^\d+(\.\d{1,3})?$/.test(trimmedValue) && Number(trimmedValue) > 0;
}

export function OrderFormPanel({
  agentContactOptions,
  customerContactOptions,
  isLoadingOptions,
  isSubmitting,
  merchantContactOptions,
  mode,
  onCancel,
  onSubmit,
  order,
  productOptions,
  showCancel = false,
}: OrderFormPanelProps) {
  const t = useTranslations('common.orders');
  const invalidAmountMessage = t('form.invalidAmount');
  const form = useForm<OrderFormValues>({
    initialValues: buildInitialValues(mode, order),
    mode: 'controlled',
    validate: {
      currency: (value) =>
        /^[A-Za-z]{3}$/.test(value.trim()) ? null : t('form.invalidCurrency'),
      notes: (value) =>
        value.trim().length > 1000 ? t('form.notesTooLong') : null,
      orderNumber: (value) => {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
          return t('form.orderNumberRequired');
        }

        return trimmedValue.length > 80 ? t('form.orderNumberTooLong') : null;
      },
    },
  });
  const isEditing = mode === 'edit';

  function getLineItemFieldPath(index: number, field: string) {
    return `items.${index}.${field}`;
  }

  function validateLineItems(values: OrderFormValues) {
    let isValid = true;

    values.items.forEach((item, index) => {
      const titlePath = getLineItemFieldPath(index, 'title');
      const quantityPath = getLineItemFieldPath(index, 'quantity');
      const unitAmountPath = getLineItemFieldPath(index, 'unitAmount');

      form.setFieldError(titlePath, null);
      form.setFieldError(quantityPath, null);
      form.setFieldError(unitAmountPath, null);

      if (!item.title.trim()) {
        form.setFieldError(titlePath, t('form.itemTitleRequired'));
        isValid = false;
      } else if (item.title.trim().length > 200) {
        form.setFieldError(titlePath, t('form.itemTitleTooLong'));
        isValid = false;
      }

      if (!isValidQuantityInput(item.quantity)) {
        form.setFieldError(quantityPath, t('form.invalidQuantity'));
        isValid = false;
      }

      if (!isValidAmountInput(item.unitAmount)) {
        form.setFieldError(unitAmountPath, invalidAmountMessage);
        isValid = false;
      }
    });

    return isValid;
  }

  function handleSubmit(values: OrderFormValues) {
    if (validateLineItems(values)) {
      onSubmit(values);
    }
  }

  function handleProductChange(index: number, productId: string | null) {
    form.setFieldValue(`items.${index}.productId`, productId);

    if (!productId) {
      return;
    }

    const product = productOptions.find((option) => option.value === productId);

    if (!product) {
      return;
    }

    form.setFieldValue(`items.${index}.title`, product.name);

    if (product.saleAmountMinor !== null) {
      form.setFieldValue(
        `items.${index}.unitAmount`,
        formatAmountInput(product.saleAmountMinor),
      );
    }
  }

  return (
    <Paper p="lg" radius="sm" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group gap="sm">
            <ThemeIcon color="orange" radius="sm" variant="light">
              <IconShoppingBag size={18} />
            </ThemeIcon>
            <Title order={2} size="h4">
              {isEditing ? t('form.editTitle') : t('form.createTitle')}
            </Title>
          </Group>

          <OrderStatusFields form={form} />

          <OrderContactFields
            agentContactOptions={agentContactOptions}
            customerContactOptions={customerContactOptions}
            form={form}
            isLoadingOptions={isLoadingOptions}
            merchantContactOptions={merchantContactOptions}
          />

          <OrderLineItemsEditor
            form={form}
            isLoadingOptions={isLoadingOptions}
            onAddItem={() =>
              form.insertListItem('items', createEmptyLineItem())
            }
            onProductChange={handleProductChange}
            productOptions={productOptions}
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
              color="orange"
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
