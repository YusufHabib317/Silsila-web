'use client';

import { Badge } from '@mantine/core';

import type {
  ProductOwnerType,
  ProductStatus,
  StockStatus,
} from '@/lib/api/types';

export const PRODUCT_FILTER_ALL = 'all';

export type ProductStatusFilter = ProductStatus | typeof PRODUCT_FILTER_ALL;
export type StockStatusFilter = StockStatus | typeof PRODUCT_FILTER_ALL;
export type ProductOwnerTypeFilter =
  | ProductOwnerType
  | typeof PRODUCT_FILTER_ALL;

type BadgeMeta = {
  color: string;
};

export const PRODUCT_STATUS_OPTIONS: Array<{
  labelKey: string;
  value: ProductStatus;
}> = [
  { labelKey: 'status.draft', value: 'draft' },
  { labelKey: 'status.active', value: 'active' },
  { labelKey: 'status.out_of_stock', value: 'out_of_stock' },
  { labelKey: 'status.price_changed', value: 'price_changed' },
  { labelKey: 'status.paused', value: 'paused' },
  { labelKey: 'status.archived', value: 'archived' },
  { labelKey: 'status.deleted', value: 'deleted' },
];

export const PRODUCT_STATUS_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: ProductStatusFilter;
}> = [
  { labelKey: 'filters.allProductStatuses', value: PRODUCT_FILTER_ALL },
  ...PRODUCT_STATUS_OPTIONS,
];

export const STOCK_STATUS_OPTIONS: Array<{
  labelKey: string;
  value: StockStatus;
}> = [
  { labelKey: 'stockStatus.in_stock', value: 'in_stock' },
  { labelKey: 'stockStatus.low_stock', value: 'low_stock' },
  { labelKey: 'stockStatus.out_of_stock', value: 'out_of_stock' },
  { labelKey: 'stockStatus.unknown', value: 'unknown' },
];

export const STOCK_STATUS_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: StockStatusFilter;
}> = [
  { labelKey: 'filters.allStockStatuses', value: PRODUCT_FILTER_ALL },
  ...STOCK_STATUS_OPTIONS,
];

export const PRODUCT_OWNER_TYPE_OPTIONS: Array<{
  labelKey: string;
  value: ProductOwnerType;
}> = [
  { labelKey: 'ownerType.own_stock', value: 'own_stock' },
  { labelKey: 'ownerType.merchant_product', value: 'merchant_product' },
  { labelKey: 'ownerType.factory_product', value: 'factory_product' },
  { labelKey: 'ownerType.agent_product', value: 'agent_product' },
  { labelKey: 'ownerType.unknown', value: 'unknown' },
];

export const PRODUCT_OWNER_TYPE_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: ProductOwnerTypeFilter;
}> = [
  { labelKey: 'filters.allOwnerTypes', value: PRODUCT_FILTER_ALL },
  ...PRODUCT_OWNER_TYPE_OPTIONS,
];

const PRODUCT_STATUS_META: Record<ProductStatus, BadgeMeta> = {
  active: { color: 'green' },
  archived: { color: 'gray' },
  deleted: { color: 'red' },
  draft: { color: 'yellow' },
  out_of_stock: { color: 'red' },
  paused: { color: 'orange' },
  price_changed: { color: 'blue' },
};

const STOCK_STATUS_META: Record<StockStatus, BadgeMeta> = {
  in_stock: { color: 'green' },
  low_stock: { color: 'yellow' },
  out_of_stock: { color: 'red' },
  unknown: { color: 'gray' },
};

const OWNER_TYPE_META: Record<ProductOwnerType, BadgeMeta> = {
  agent_product: { color: 'blue' },
  factory_product: { color: 'grape' },
  merchant_product: { color: 'orange' },
  own_stock: { color: 'teal' },
  unknown: { color: 'gray' },
};

const PRODUCT_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
};

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

export function formatProductDate(
  value: string | null,
  fallbackLabel: string,
  locale: string,
) {
  if (!value) {
    return fallbackLabel;
  }

  const date = new Date(value);

  if (!isValidDate(date)) {
    return fallbackLabel;
  }

  return new Intl.DateTimeFormat(locale, PRODUCT_DATE_FORMAT_OPTIONS).format(
    date,
  );
}

export function formatProductAmount(
  amountMinor: number | null,
  currency: string,
  fallbackLabel: string,
  locale: string,
) {
  if (amountMinor === null) {
    return fallbackLabel;
  }

  const amount = amountMinor / 100;

  try {
    return new Intl.NumberFormat(locale, {
      currency,
      style: 'currency',
    }).format(amount);
  } catch {
    return `${amount.toLocaleString(locale)} ${currency}`;
  }
}

export function ProductStatusBadge({
  label,
  status,
}: {
  label: string;
  status: ProductStatus;
}) {
  const meta = PRODUCT_STATUS_META[status];

  return (
    <Badge color={meta.color} radius="sm" variant="light">
      {label}
    </Badge>
  );
}

export function StockStatusBadge({
  label,
  status,
}: {
  label: string;
  status: StockStatus;
}) {
  const meta = STOCK_STATUS_META[status];

  return (
    <Badge color={meta.color} radius="sm" variant="light">
      {label}
    </Badge>
  );
}

export function ProductOwnerTypeBadge({
  label,
  ownerType,
}: {
  label: string;
  ownerType: ProductOwnerType;
}) {
  const meta = OWNER_TYPE_META[ownerType];

  return (
    <Badge color={meta.color} radius="sm" variant="light">
      {label}
    </Badge>
  );
}
