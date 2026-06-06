import type { ProductContactOption } from './product-form-panel';

import type { Contact, Paginated } from '@/lib/api/types';

const CONTACT_LABEL_SEPARATOR = ' - ';

export function buildProductContactOptions(
  contactsPage: Paginated<Contact> | undefined,
): ProductContactOption[] {
  return (
    contactsPage?.items.map((contact) => ({
      label: contact.phoneNumber
        ? `${contact.displayName}${CONTACT_LABEL_SEPARATOR}${contact.phoneNumber}`
        : contact.displayName,
      value: contact.id,
    })) ?? []
  );
}
