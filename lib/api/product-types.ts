export type ProductOwnerType =
  | 'own_stock'
  | 'merchant_product'
  | 'factory_product'
  | 'agent_product'
  | 'unknown';

export type ProductStatus =
  | 'draft'
  | 'active'
  | 'out_of_stock'
  | 'price_changed'
  | 'paused'
  | 'archived'
  | 'deleted';

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown';

export type Product = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  ownerType: ProductOwnerType;
  ownerContactId: string | null;
  merchantContactId: string | null;
  sourceBundleId: string | null;
  costAmountMinor: number | null;
  saleAmountMinor: number | null;
  agentAmountMinor: number | null;
  currency: string;
  stockStatus: StockStatus;
  productStatus: ProductStatus;
  notes: string | null;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductRequest = {
  agentAmountMinor?: number | null;
  categoryId?: string | null;
  costAmountMinor?: number | null;
  currency?: string;
  description?: string | null;
  merchantContactId?: string | null;
  name: string;
  notes?: string | null;
  ownerContactId?: string | null;
  ownerType?: ProductOwnerType;
  productStatus?: ProductStatus;
  saleAmountMinor?: number | null;
  sourceBundleId?: string | null;
  stockStatus?: StockStatus;
};

export type UpdateProductRequest = {
  agentAmountMinor?: number | null;
  categoryId?: string | null;
  costAmountMinor?: number | null;
  currency?: string;
  description?: string | null;
  merchantContactId?: string | null;
  name?: string;
  notes?: string | null;
  ownerContactId?: string | null;
  ownerType?: ProductOwnerType;
  productStatus?: ProductStatus;
  saleAmountMinor?: number | null;
  sourceBundleId?: string | null;
  stockStatus?: StockStatus;
};
