export type CommissionType = 'fixed_amount' | 'percentage' | 'manual';

export type CommissionRecordType = CommissionType | 'unknown';

export type CommissionStatus = 'pending' | 'approved' | 'paid' | 'cancelled';

export type Commission = {
  id: string;
  orderId: string | null;
  productId: string | null;
  contactId: string;
  commissionType: CommissionRecordType;
  amountMinor: number | null;
  percentage: number | null;
  currency: string;
  status: CommissionStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCommissionRequest = {
  amountMinor?: number | null;
  commissionType?: CommissionType;
  contactId: string;
  currency?: string;
  orderId?: string | null;
  paidAt?: string | null;
  percentage?: number | null;
  productId?: string | null;
  status?: CommissionStatus;
};

export type UpdateCommissionRequest = {
  amountMinor?: number | null;
  commissionType?: CommissionType;
  contactId?: string;
  currency?: string;
  orderId?: string | null;
  paidAt?: string | null;
  percentage?: number | null;
  productId?: string | null;
  status?: CommissionStatus;
};
