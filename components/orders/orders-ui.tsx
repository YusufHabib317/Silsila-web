'use client';

import { Badge } from '@mantine/core';

import type {
  DeliveryStatus,
  OrderStatus,
  PaymentStatus,
} from '@/lib/api/types';

export const ORDER_FILTER_ALL = 'all';

export type OrderStatusFilter = OrderStatus | typeof ORDER_FILTER_ALL;
export type PaymentStatusFilter = PaymentStatus | typeof ORDER_FILTER_ALL;
export type DeliveryStatusFilter = DeliveryStatus | typeof ORDER_FILTER_ALL;

type BadgeMeta = {
  color: string;
};

export const ORDER_STATUS_OPTIONS: Array<{
  labelKey: string;
  value: OrderStatus;
}> = [
  { labelKey: 'status.new', value: 'new' },
  { labelKey: 'status.needs_review', value: 'needs_review' },
  { labelKey: 'status.confirmed', value: 'confirmed' },
  { labelKey: 'status.preparing', value: 'preparing' },
  { labelKey: 'status.shipped', value: 'shipped' },
  { labelKey: 'status.delivered', value: 'delivered' },
  { labelKey: 'status.paid', value: 'paid' },
  { labelKey: 'status.cancelled', value: 'cancelled' },
  { labelKey: 'status.returned', value: 'returned' },
  { labelKey: 'status.failed', value: 'failed' },
];

export const ORDER_STATUS_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: OrderStatusFilter;
}> = [
  { labelKey: 'filters.allStatuses', value: ORDER_FILTER_ALL },
  ...ORDER_STATUS_OPTIONS,
];

export const PAYMENT_STATUS_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: PaymentStatusFilter;
}> = [
  { labelKey: 'filters.allPaymentStatuses', value: ORDER_FILTER_ALL },
  { labelKey: 'paymentStatus.unpaid', value: 'unpaid' },
  { labelKey: 'paymentStatus.partial', value: 'partial' },
  { labelKey: 'paymentStatus.paid', value: 'paid' },
  { labelKey: 'paymentStatus.refunded', value: 'refunded' },
  { labelKey: 'paymentStatus.unknown', value: 'unknown' },
];

export const DELIVERY_STATUS_FILTER_OPTIONS: Array<{
  labelKey: string;
  value: DeliveryStatusFilter;
}> = [
  { labelKey: 'filters.allDeliveryStatuses', value: ORDER_FILTER_ALL },
  { labelKey: 'deliveryStatus.not_started', value: 'not_started' },
  { labelKey: 'deliveryStatus.preparing', value: 'preparing' },
  { labelKey: 'deliveryStatus.with_delivery', value: 'with_delivery' },
  { labelKey: 'deliveryStatus.delivered', value: 'delivered' },
  { labelKey: 'deliveryStatus.returned', value: 'returned' },
  { labelKey: 'deliveryStatus.failed', value: 'failed' },
  { labelKey: 'deliveryStatus.unknown', value: 'unknown' },
];

const ORDER_STATUS_META: Record<OrderStatus, BadgeMeta> = {
  new: { color: 'blue' },
  needs_review: { color: 'yellow' },
  confirmed: { color: 'teal' },
  preparing: { color: 'indigo' },
  shipped: { color: 'cyan' },
  delivered: { color: 'green' },
  paid: { color: 'green' },
  cancelled: { color: 'gray' },
  returned: { color: 'orange' },
  failed: { color: 'red' },
};

const PAYMENT_STATUS_META: Record<PaymentStatus, BadgeMeta> = {
  unpaid: { color: 'red' },
  partial: { color: 'yellow' },
  paid: { color: 'green' },
  refunded: { color: 'grape' },
  unknown: { color: 'gray' },
};

const DELIVERY_STATUS_META: Record<DeliveryStatus, BadgeMeta> = {
  not_started: { color: 'gray' },
  preparing: { color: 'blue' },
  with_delivery: { color: 'cyan' },
  delivered: { color: 'green' },
  returned: { color: 'orange' },
  failed: { color: 'red' },
  unknown: { color: 'gray' },
};

const ORDER_DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  month: 'short',
};

function isValidDate(date: Date) {
  return !Number.isNaN(date.getTime());
}

export function formatOrderDate(
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

  return new Intl.DateTimeFormat(locale, ORDER_DATE_FORMAT_OPTIONS).format(
    date,
  );
}

export function formatOrderAmount(
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

export function OrderStatusBadge({
  label,
  status,
}: {
  label: string;
  status: OrderStatus;
}) {
  const meta = ORDER_STATUS_META[status];

  return (
    <Badge color={meta.color} radius="sm" variant="light">
      {label}
    </Badge>
  );
}

export function PaymentStatusBadge({
  label,
  status,
}: {
  label: string;
  status: PaymentStatus;
}) {
  const meta = PAYMENT_STATUS_META[status];

  return (
    <Badge color={meta.color} radius="sm" variant="light">
      {label}
    </Badge>
  );
}

export function DeliveryStatusBadge({
  label,
  status,
}: {
  label: string;
  status: DeliveryStatus;
}) {
  const meta = DELIVERY_STATUS_META[status];

  return (
    <Badge color={meta.color} radius="sm" variant="light">
      {label}
    </Badge>
  );
}
