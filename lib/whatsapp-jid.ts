// Helpers for turning raw WhatsApp JIDs into something a human can read.
//
// A JID looks like `<user>@<domain>` (sometimes `<user>:<device>@<domain>`):
//   12345@s.whatsapp.net / 12345@c.us  → direct chat, `user` is a phone number
//   12345@lid                          → direct chat, but a privacy-masked id
//   1203...@g.us                       → group, `user` is an opaque group id
//   1203...@newsletter                 → channel (broadcast), opaque id
//   status@broadcast                   → broadcast list / status

export type WhatsappChatKind =
  | 'direct'
  | 'group'
  | 'channel'
  | 'broadcast'
  | 'unknown';

const PHONE_JID_DOMAINS = new Set(['s.whatsapp.net', 'c.us']);

function getJidUser(jid: string | null | undefined): string {
  return jid?.split('@')[0]?.split(':')[0] ?? '';
}

function getJidDomain(jid: string | null | undefined): string {
  return jid?.split('@')[1] ?? '';
}

export function getWhatsappChatKind(
  externalId: string | null | undefined,
): WhatsappChatKind {
  switch (getJidDomain(externalId)) {
    case 's.whatsapp.net':
    case 'c.us':
    case 'lid':
      return 'direct';
    case 'g.us':
      return 'group';
    case 'newsletter':
      return 'channel';
    case 'broadcast':
      return 'broadcast';
    default:
      return 'unknown';
  }
}

// Only phone-addressed JIDs encode a real number, so coerce just those into a
// readable `+digits` value; group / channel / lid ids are not phone numbers.
export function jidToPhoneNumber(
  jid: string | null | undefined,
): string | null {
  const user = getJidUser(jid);

  if (!/^\d+$/.test(user) || !PHONE_JID_DOMAINS.has(getJidDomain(jid))) {
    return null;
  }

  return `+${user}`;
}

// Group an E.164-ish number into readable triplets, e.g. +963 956 086 725.
export function formatPhoneNumber(
  phone: string | null | undefined,
): string | null {
  if (!phone) {
    return null;
  }

  const digits = phone.replace(/\D/g, '');

  if (!digits) {
    return phone;
  }

  return `+${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`;
}

// Last-resort display when there is no human name and no phone: drop the
// opaque `@domain` so we at least don't show the full raw JID.
export function stripJidDomain(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  return jidToPhoneNumber(value) ?? (getJidUser(value) || value);
}
