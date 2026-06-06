'use client';

import { apiFetch } from './client';
import type {
  CreateOrderRequest,
  DeliveryStatus,
  Order,
  OrderStatus,
  Paginated,
  PaymentStatus,
  UpdateOrderRequest,
  UpdateOrderStatusRequest,
} from './types';

export type ListOrdersParams = {
  agentContactId?: string;
  currency?: string;
  cursor?: string | null;
  customerContactId?: string;
  deliveryStatus?: DeliveryStatus;
  limit?: number;
  merchantContactId?: string;
  paymentStatus?: PaymentStatus;
  productId?: string;
  search?: string;
  sourceBundleId?: string;
  status?: OrderStatus;
};

function setOptionalParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | null | undefined,
) {
  const trimmedValue = value?.trim();

  if (trimmedValue) {
    searchParams.set(key, trimmedValue);
  }
}

function buildOrdersQueryString(params: ListOrdersParams) {
  const searchParams = new URLSearchParams();

  setOptionalParam(searchParams, 'status', params.status);
  setOptionalParam(searchParams, 'paymentStatus', params.paymentStatus);
  setOptionalParam(searchParams, 'deliveryStatus', params.deliveryStatus);
  setOptionalParam(searchParams, 'customerContactId', params.customerContactId);
  setOptionalParam(searchParams, 'merchantContactId', params.merchantContactId);
  setOptionalParam(searchParams, 'agentContactId', params.agentContactId);
  setOptionalParam(searchParams, 'sourceBundleId', params.sourceBundleId);
  setOptionalParam(searchParams, 'productId', params.productId);
  setOptionalParam(searchParams, 'currency', params.currency);
  setOptionalParam(searchParams, 'search', params.search);

  if (typeof params.limit === 'number') {
    searchParams.set('limit', String(params.limit));
  }

  if (params.cursor) {
    searchParams.set('cursor', params.cursor);
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : '';
}

export function listOrders(params: ListOrdersParams = {}) {
  return apiFetch<Paginated<Order>>(`/orders${buildOrdersQueryString(params)}`);
}

export function getOrder(orderId: string) {
  return apiFetch<Order>(`/orders/${orderId}`);
}

export function createOrder(body: CreateOrderRequest) {
  return apiFetch<Order>('/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateOrder(orderId: string, body: UpdateOrderRequest) {
  return apiFetch<Order>(`/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const body: UpdateOrderStatusRequest = { status };

  return apiFetch<Order>(`/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
