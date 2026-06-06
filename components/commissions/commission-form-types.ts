import type {
  Commission,
  CommissionRecordType,
  CommissionStatus,
  CommissionType,
} from '@/lib/api/types';

export type CommissionFormMode = 'create' | 'edit';

export type CommissionFormValues = {
  amount: string;
  commissionType: CommissionType;
  contactId: string | null;
  currency: string;
  orderId: string | null;
  paidAt: string;
  percentage: string;
  productId: string | null;
  status: CommissionStatus;
};

function formatAmountInput(amountMinor: number | null) {
  if (amountMinor === null) {
    return '';
  }

  return (amountMinor / 100).toFixed(2);
}

function formatPercentageInput(percentage: number | null) {
  if (percentage === null) {
    return '';
  }

  return String(percentage);
}

function toLocalDateTimeInput(value: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

function toEditableCommissionType(
  commissionType: CommissionRecordType,
): CommissionType {
  if (
    commissionType === 'fixed_amount' ||
    commissionType === 'percentage' ||
    commissionType === 'manual'
  ) {
    return commissionType;
  }

  return 'manual';
}

export function buildInitialCommissionFormValues({
  commission,
  initialOrderId,
  initialProductId,
  mode,
}: {
  commission: Commission | null;
  initialOrderId: string | null | undefined;
  initialProductId: string | null | undefined;
  mode: CommissionFormMode;
}): CommissionFormValues {
  if (mode === 'edit' && commission) {
    return {
      amount: formatAmountInput(commission.amountMinor),
      commissionType: toEditableCommissionType(commission.commissionType),
      contactId: commission.contactId,
      currency: commission.currency,
      orderId: commission.orderId,
      paidAt: toLocalDateTimeInput(commission.paidAt),
      percentage: formatPercentageInput(commission.percentage),
      productId: commission.productId,
      status: commission.status,
    };
  }

  return {
    amount: '',
    commissionType: 'manual',
    contactId: null,
    currency: 'SYP',
    orderId: initialOrderId ?? null,
    paidAt: '',
    percentage: '',
    productId: initialProductId ?? null,
    status: 'pending',
  };
}

export function isValidCommissionDecimalInput(value: string) {
  return /^\d+(\.\d{1,2})?$/.test(value.trim());
}

export function buildTranslatedSelectData(
  options: Array<{ labelKey: string; value: string }>,
  translate: (key: string) => string,
) {
  return options.map((option) => ({
    label: translate(option.labelKey),
    value: option.value,
  }));
}
