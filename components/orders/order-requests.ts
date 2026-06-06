import type { ListOrdersParams } from '@/lib/api/orders';
import type { CreateOrderRequest, UpdateOrderRequest } from '@/lib/api/types';

import type { OrderFormValues } from './order-form-panel';
import {
  type DeliveryStatusFilter,
  ORDER_FILTER_ALL,
  type OrderStatusFilter,
  type PaymentStatusFilter,
} from './orders-ui';

export const ORDER_PAGE_LIMIT = 50;

export type OrderFilters = {
  deliveryStatusFilter: DeliveryStatusFilter;
  paymentStatusFilter: PaymentStatusFilter;
  search: string;
  statusFilter: OrderStatusFilter;
};

export function buildOrderParams(
  filters: OrderFilters,
  cursor: string | null,
): ListOrdersParams {
  const params: ListOrdersParams = {
    cursor,
    limit: ORDER_PAGE_LIMIT,
  };

  if (filters.statusFilter !== ORDER_FILTER_ALL) {
    params.status = filters.statusFilter;
  }

  if (filters.paymentStatusFilter !== ORDER_FILTER_ALL) {
    params.paymentStatus = filters.paymentStatusFilter;
  }

  if (filters.deliveryStatusFilter !== ORDER_FILTER_ALL) {
    params.deliveryStatus = filters.deliveryStatusFilter;
  }

  if (filters.search) {
    params.search = filters.search;
  }

  return params;
}

function cleanText(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue || null;
}

function toAmountMinor(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return Math.round(Number(trimmedValue) * 100);
}

function toQuantity(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 1;
  }

  return Number(trimmedValue);
}

function buildOrderLineItems(values: OrderFormValues) {
  const currency = values.currency.trim().toUpperCase();

  return values.items.map((item) => ({
    currency,
    productId: item.productId,
    quantity: toQuantity(item.quantity),
    title: item.title.trim(),
    unitAmountMinor: toAmountMinor(item.unitAmount),
  }));
}

export function buildCreateOrderRequest(
  values: OrderFormValues,
): CreateOrderRequest {
  const notes = cleanText(values.notes);
  const sourceBundleId = cleanText(values.sourceBundleId);

  return {
    currency: values.currency.trim().toUpperCase(),
    deliveryStatus: values.deliveryStatus,
    items: buildOrderLineItems(values),
    orderNumber: values.orderNumber.trim(),
    paymentStatus: values.paymentStatus,
    status: values.status,
    ...(notes ? { notes } : {}),
    ...(sourceBundleId ? { sourceBundleId } : {}),
    ...(values.agentContactId ? { agentContactId: values.agentContactId } : {}),
    ...(values.customerContactId
      ? { customerContactId: values.customerContactId }
      : {}),
    ...(values.merchantContactId
      ? { merchantContactId: values.merchantContactId }
      : {}),
  };
}

export function buildUpdateOrderRequest(
  values: OrderFormValues,
): UpdateOrderRequest {
  return {
    agentContactId: values.agentContactId,
    currency: values.currency.trim().toUpperCase(),
    customerContactId: values.customerContactId,
    deliveryStatus: values.deliveryStatus,
    items: buildOrderLineItems(values),
    merchantContactId: values.merchantContactId,
    notes: cleanText(values.notes),
    orderNumber: values.orderNumber.trim(),
    paymentStatus: values.paymentStatus,
    sourceBundleId: cleanText(values.sourceBundleId),
    status: values.status,
  };
}
