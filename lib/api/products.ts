'use client';

import { apiFetch } from './client';
import type {
  CreateProductRequest,
  Paginated,
  Product,
  ProductOwnerType,
  ProductStatus,
  StockStatus,
  UpdateProductRequest,
} from './types';

export type ListProductsParams = {
  categoryId?: string;
  currency?: string;
  cursor?: string | null;
  limit?: number;
  merchantContactId?: string;
  ownerContactId?: string;
  ownerType?: ProductOwnerType;
  productStatus?: ProductStatus;
  search?: string;
  sourceBundleId?: string;
  stockStatus?: StockStatus;
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

function buildProductsQueryString(params: ListProductsParams) {
  const searchParams = new URLSearchParams();

  setOptionalParam(searchParams, 'productStatus', params.productStatus);
  setOptionalParam(searchParams, 'stockStatus', params.stockStatus);
  setOptionalParam(searchParams, 'ownerType', params.ownerType);
  setOptionalParam(searchParams, 'ownerContactId', params.ownerContactId);
  setOptionalParam(searchParams, 'merchantContactId', params.merchantContactId);
  setOptionalParam(searchParams, 'sourceBundleId', params.sourceBundleId);
  setOptionalParam(searchParams, 'categoryId', params.categoryId);
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

export function listProducts(params: ListProductsParams = {}) {
  return apiFetch<Paginated<Product>>(
    `/products${buildProductsQueryString(params)}`,
  );
}

export function getProduct(productId: string) {
  return apiFetch<Product>(`/products/${productId}`);
}

export function createProduct(body: CreateProductRequest) {
  return apiFetch<Product>('/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateProduct(productId: string, body: UpdateProductRequest) {
  return apiFetch<Product>(`/products/${productId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
