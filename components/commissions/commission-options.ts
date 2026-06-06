import type { Contact, Order, Paginated, Product } from '@/lib/api/types';

const LABEL_SEPARATOR = ' - ';

export type CommissionContactOption = {
  label: string;
  value: string;
};

export type CommissionOrderOption = {
  currency: string;
  label: string;
  orderNumber: string;
  value: string;
};

export type CommissionProductOption = {
  currency: string;
  label: string;
  name: string;
  value: string;
};

export type CommissionFormOptions = {
  contactOptions: CommissionContactOption[];
  orderOptions: CommissionOrderOption[];
  productOptions: CommissionProductOption[];
};

function buildContactLabel(contact: Contact) {
  return contact.phoneNumber
    ? `${contact.displayName}${LABEL_SEPARATOR}${contact.phoneNumber}`
    : contact.displayName;
}

export function buildCommissionContactOptions(
  contactsPage: Paginated<Contact> | undefined,
): CommissionContactOption[] {
  return (
    contactsPage?.items.map((contact) => ({
      label: buildContactLabel(contact),
      value: contact.id,
    })) ?? []
  );
}

export function buildCommissionOrderOptions(
  ordersPage: Paginated<Order> | undefined,
): CommissionOrderOption[] {
  return (
    ordersPage?.items.map((order) => ({
      currency: order.currency,
      label: order.orderNumber,
      orderNumber: order.orderNumber,
      value: order.id,
    })) ?? []
  );
}

export function buildCommissionProductOptions(
  productsPage: Paginated<Product> | undefined,
): CommissionProductOption[] {
  return (
    productsPage?.items.map((product) => ({
      currency: product.currency,
      label: product.name,
      name: product.name,
      value: product.id,
    })) ?? []
  );
}

export function buildOptionLabelMap(
  options: Array<{ label: string; value: string }>,
) {
  return new Map(options.map((option) => [option.value, option.label]));
}
