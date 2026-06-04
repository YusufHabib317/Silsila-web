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
