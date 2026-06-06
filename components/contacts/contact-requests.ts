import type { ListContactsParams } from '@/lib/api/contacts';
import type {
  CreateContactRequest,
  UpdateContactRequest,
} from '@/lib/api/types';

import type { ContactFormValues } from './contact-form-panel';
import { CONTACT_FILTER_ALL, type ContactRoleFilter } from './contacts-ui';

export const CONTACT_PAGE_LIMIT = 50;

export type ContactFilters = {
  roleFilter: ContactRoleFilter;
  search: string;
};

export function buildContactParams(
  filters: ContactFilters,
  cursor: string | null,
): ListContactsParams {
  const params: ListContactsParams = {
    cursor,
    limit: CONTACT_PAGE_LIMIT,
  };

  if (filters.roleFilter !== CONTACT_FILTER_ALL) {
    params.role = filters.roleFilter;
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

function cleanWhatsappExternalContactIds(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\n,]+/)
        .map((externalContactId) => externalContactId.trim())
        .filter(Boolean),
    ),
  );
}

export function buildCreateContactRequest(
  values: ContactFormValues,
): CreateContactRequest {
  const phoneNumber = cleanText(values.phoneNumber);
  const notes = cleanText(values.notes);
  const whatsappExternalContactIds = cleanWhatsappExternalContactIds(
    values.whatsappExternalContactIdsText,
  );

  return {
    displayName: values.displayName.trim(),
    ...(phoneNumber ? { phoneNumber } : {}),
    ...(notes ? { notes } : {}),
    ...(values.roles.length > 0 ? { roles: values.roles } : {}),
    ...(whatsappExternalContactIds.length > 0
      ? { whatsappExternalContactIds }
      : {}),
  };
}

export function buildUpdateContactRequest(
  values: ContactFormValues,
): UpdateContactRequest {
  return {
    displayName: values.displayName.trim(),
    notes: cleanText(values.notes),
    phoneNumber: cleanText(values.phoneNumber),
    roles: values.roles,
    whatsappExternalContactIds: cleanWhatsappExternalContactIds(
      values.whatsappExternalContactIdsText,
    ),
  };
}
