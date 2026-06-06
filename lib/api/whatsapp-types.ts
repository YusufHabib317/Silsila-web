export type WhatsappAccountStatus =
  | 'pending_qr'
  | 'qr_ready'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'expired'
  | 'failed'
  | 'disabled';

export type WhatsappAccount = {
  id: string;
  phoneNumber: string | null;
  displayName: string | null;
  status: WhatsappAccountStatus;
  lastConnectedAt: string | null;
  lastDisconnectedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WhatsappAccountDetail = WhatsappAccount & {
  qrAvailable: boolean;
  qrCode: string | null;
  qrExpiresAt: string | null;
};

export type CreateWhatsappAccountRequest = {
  phoneNumber?: string | null;
  displayName?: string | null;
};

export type WhatsappSourceType =
  | 'merchant_group'
  | 'agent_group'
  | 'customer_chat'
  | 'supplier_chat'
  | 'internal_team'
  | 'unknown';

export type TrackedSourceStatus = 'tracked' | 'ignored' | 'personal';

export type TrackedSource = {
  id: string;
  status: TrackedSourceStatus;
  sourceType: WhatsappSourceType;
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WhatsappChat = {
  id: string;
  whatsappAccountId: string;
  externalChatId: string;
  displayName: string | null;
  sourceType: WhatsappSourceType;
  tracking: TrackedSource | null;
  createdAt: string;
  updatedAt: string;
};

export type UpdateTrackedSourceRequest = {
  status: TrackedSourceStatus;
  sourceType?: WhatsappSourceType;
};

export type WhatsappMessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'voice'
  | 'document'
  | 'sticker'
  | 'location'
  | 'contact'
  | 'unknown';

export type WhatsappMessageChat = {
  externalChatId: string;
  displayName: string | null;
};

export type WhatsappMessageSender = {
  externalContactId: string;
  phoneNumber: string | null;
  displayName: string | null;
};

export type WhatsappMessageLinkedContact = {
  id: string;
  displayName: string;
  phoneNumber: string | null;
};

export type WhatsappMessage = {
  id: string;
  whatsappAccountId: string;
  chatId: string;
  senderContactId: string | null;
  externalMessageId: string;
  messageType: WhatsappMessageType;
  bodyText: string | null;
  isFromMe: boolean;
  isTracked: boolean;
  isLinked: boolean;
  isArchived: boolean;
  isPersonal: boolean;
  isTemporary: boolean;
  expiresAt: string;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
  chat: WhatsappMessageChat | null;
  sender: WhatsappMessageSender | null;
  linkedContact: WhatsappMessageLinkedContact | null;
};
