'use client';

import {
  ActionIcon,
  Button,
  Group,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
  Tooltip,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { OrderProductOption } from './order-options';
import type { OrderFormValues } from './order-form-panel';

type OrderLineItemsEditorProps = {
  form: UseFormReturnType<OrderFormValues>;
  isLoadingOptions: boolean;
  onAddItem: () => void;
  onProductChange: (index: number, productId: string | null) => void;
  productOptions: OrderProductOption[];
};

function getItemFieldPath(index: number, field: string) {
  return `items.${index}.${field}`;
}

export function OrderLineItemsEditor({
  form,
  isLoadingOptions,
  onAddItem,
  onProductChange,
  productOptions,
}: OrderLineItemsEditorProps) {
  const t = useTranslations('common.orders');
  const productSelectData = useMemo(
    () =>
      productOptions.map((product) => ({
        label: product.label,
        value: product.value,
      })),
    [productOptions],
  );

  return (
    <Stack gap="xs">
      <Group justify="space-between" wrap="wrap">
        <Title order={3} size="h5">
          {t('form.lineItemsTitle')}
        </Title>
        <Button
          leftSection={<IconPlus size={18} />}
          onClick={onAddItem}
          type="button"
          variant="light"
        >
          {t('actions.addItem')}
        </Button>
      </Group>

      <Table.ScrollContainer minWidth={760}>
        <Table verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t('form.productLabel')}</Table.Th>
              <Table.Th>{t('form.itemTitleLabel')}</Table.Th>
              <Table.Th w={120}>{t('form.quantityLabel')}</Table.Th>
              <Table.Th w={150}>{t('form.unitAmountLabel')}</Table.Th>
              <Table.Th w={56} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {form.values.items.map((item, index) => (
              <Table.Tr key={`${index}-${item.productId ?? 'manual'}`}>
                <Table.Td>
                  <Select
                    clearable
                    data={productSelectData}
                    disabled={isLoadingOptions}
                    onChange={(value) => onProductChange(index, value)}
                    placeholder={t('form.productPlaceholder')}
                    searchable
                    value={item.productId}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    placeholder={t('form.itemTitlePlaceholder')}
                    {...form.getInputProps(getItemFieldPath(index, 'title'))}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    placeholder="1"
                    {...form.getInputProps(getItemFieldPath(index, 'quantity'))}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    placeholder={t('form.amountPlaceholder')}
                    {...form.getInputProps(
                      getItemFieldPath(index, 'unitAmount'),
                    )}
                  />
                </Table.Td>
                <Table.Td>
                  <Tooltip label={t('actions.removeItem')}>
                    <ActionIcon
                      aria-label={t('actions.removeItem')}
                      color="red"
                      disabled={form.values.items.length === 1}
                      onClick={() => form.removeListItem('items', index)}
                      type="button"
                      variant="subtle"
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <Text c="dimmed" size="xs">
        {t('form.lineItemsSummary', { count: form.values.items.length })}
      </Text>
    </Stack>
  );
}
