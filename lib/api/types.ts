export type TenantRole =
  | 'owner'
  | 'manager'
  | 'agent'
  | 'viewer'
  | 'accountant';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string;
};

export type TenantMembership = {
  id: string;
  name: string;
  slug: string;
  role: TenantRole;
};

export type AuthResponse = {
  user: AuthUser;
  tenants: TenantMembership[];
  isPlatformAdmin: boolean;
  sessionExpiresAt: string;
  csrfToken: string;
};

export type MeResponse = Omit<AuthResponse, 'sessionExpiresAt' | 'csrfToken'>;

export type CsrfResponse = {
  csrfToken: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  displayName: string;
  tenantName: string;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  requestId: string;
  details?: unknown;
};

export type ApiErrorResponse = {
  error: ApiErrorBody;
};

export type PageInfo = {
  limit: number;
  nextCursor: string | null;
  hasMore: boolean;
};

export type Paginated<TItem> = {
  items: TItem[];
  pageInfo: PageInfo;
};

export type OrderStatus =
  | 'new'
  | 'needs_review'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'paid'
  | 'cancelled'
  | 'returned'
  | 'failed';

export type PaymentStatus =
  | 'unpaid'
  | 'partial'
  | 'paid'
  | 'refunded'
  | 'unknown';

export type DeliveryStatus =
  | 'not_started'
  | 'preparing'
  | 'with_delivery'
  | 'delivered'
  | 'returned'
  | 'failed'
  | 'unknown';

export type OrderLineItem = {
  id: string;
  productId: string | null;
  title: string;
  quantity: number;
  unitAmountMinor: number | null;
  totalAmountMinor: number | null;
  currency: string;
  createdAt: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerContactId: string | null;
  merchantContactId: string | null;
  agentContactId: string | null;
  sourceBundleId: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  totalAmountMinor: number | null;
  currency: string;
  notes: string | null;
  createdByUserId: string | null;
  items: OrderLineItem[];
  createdAt: string;
  updatedAt: string;
};

export type UpdateOrderStatusRequest = {
  status: OrderStatus;
};

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
};
