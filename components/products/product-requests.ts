import type { ListProductsParams } from '@/lib/api/products';
import type {
  CreateProductRequest,
  UpdateProductRequest,
} from '@/lib/api/types';

import type { ProductFormValues } from './product-form-panel';
import {
  PRODUCT_FILTER_ALL,
  type ProductOwnerTypeFilter,
  type ProductStatusFilter,
  type StockStatusFilter,
} from './products-ui';

export const PRODUCT_PAGE_LIMIT = 50;

export type ProductFilters = {
  ownerTypeFilter: ProductOwnerTypeFilter;
  search: string;
  statusFilter: ProductStatusFilter;
  stockStatusFilter: StockStatusFilter;
};

export function buildProductParams(
  filters: ProductFilters,
  cursor: string | null,
): ListProductsParams {
  const params: ListProductsParams = {
    cursor,
    limit: PRODUCT_PAGE_LIMIT,
  };

  if (filters.statusFilter !== PRODUCT_FILTER_ALL) {
    params.productStatus = filters.statusFilter;
  }

  if (filters.stockStatusFilter !== PRODUCT_FILTER_ALL) {
    params.stockStatus = filters.stockStatusFilter;
  }

  if (filters.ownerTypeFilter !== PRODUCT_FILTER_ALL) {
    params.ownerType = filters.ownerTypeFilter;
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

export function buildCreateProductRequest(
  values: ProductFormValues,
): CreateProductRequest {
  const agentAmountMinor = toAmountMinor(values.agentAmount);
  const categoryId = cleanText(values.categoryId);
  const costAmountMinor = toAmountMinor(values.costAmount);
  const description = cleanText(values.description);
  const notes = cleanText(values.notes);
  const saleAmountMinor = toAmountMinor(values.saleAmount);
  const sourceBundleId = cleanText(values.sourceBundleId);

  return {
    currency: values.currency.trim().toUpperCase(),
    name: values.name.trim(),
    ownerType: values.ownerType,
    productStatus: values.productStatus,
    stockStatus: values.stockStatus,
    ...(agentAmountMinor !== null ? { agentAmountMinor } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(costAmountMinor !== null ? { costAmountMinor } : {}),
    ...(description ? { description } : {}),
    ...(notes ? { notes } : {}),
    ...(saleAmountMinor !== null ? { saleAmountMinor } : {}),
    ...(sourceBundleId ? { sourceBundleId } : {}),
    ...(values.merchantContactId
      ? { merchantContactId: values.merchantContactId }
      : {}),
    ...(values.ownerContactId ? { ownerContactId: values.ownerContactId } : {}),
  };
}

export function buildUpdateProductRequest(
  values: ProductFormValues,
): UpdateProductRequest {
  return {
    agentAmountMinor: toAmountMinor(values.agentAmount),
    categoryId: cleanText(values.categoryId),
    costAmountMinor: toAmountMinor(values.costAmount),
    currency: values.currency.trim().toUpperCase(),
    description: cleanText(values.description),
    merchantContactId: values.merchantContactId,
    name: values.name.trim(),
    notes: cleanText(values.notes),
    ownerContactId: values.ownerContactId,
    ownerType: values.ownerType,
    productStatus: values.productStatus,
    saleAmountMinor: toAmountMinor(values.saleAmount),
    sourceBundleId: cleanText(values.sourceBundleId),
    stockStatus: values.stockStatus,
  };
}
