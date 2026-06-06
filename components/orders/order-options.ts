import type { Contact, Paginated, Product } from '@/lib/api/types';

const CONTACT_LABEL_SEPARATOR = ' - ';

export type OrderContactOption = {
  label: string;
  value: string;
};

export type OrderProductOption = {
  currency: string;
  label: string;
  name: string;
  saleAmountMinor: number | null;
  value: string;
};

export type OrderFormOptions = {
  agentContactOptions: OrderContactOption[];
  customerContactOptions: OrderContactOption[];
  merchantContactOptions: OrderContactOption[];
  productOptions: OrderProductOption[];
};

function buildContactLabel(contact: Contact) {
  return contact.phoneNumber
    ? `${contact.displayName}${CONTACT_LABEL_SEPARATOR}${contact.phoneNumber}`
    : contact.displayName;
}

export function buildOrderContactOptions(
  contactsPage: Paginated<Contact> | undefined,
): OrderContactOption[] {
  return (
    contactsPage?.items.map((contact) => ({
      label: buildContactLabel(contact),
      value: contact.id,
    })) ?? []
  );
}

export function buildOrderProductOptions(
  productsPage: Paginated<Product> | undefined,
): OrderProductOption[] {
  return (
    productsPage?.items.map((product) => ({
      currency: product.currency,
      label: product.name,
      name: product.name,
      saleAmountMinor: product.saleAmountMinor,
      value: product.id,
    })) ?? []
  );
}
