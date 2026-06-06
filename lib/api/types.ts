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

export type ContactRole =
  | 'merchant'
  | 'agent'
  | 'customer'
  | 'supplier'
  | 'factory'
  | 'internal'
  | 'unknown';

export type ContactRoleAssignment = {
  id: string;
  role: ContactRole;
  contextType: string | null;
  contextId: string | null;
  createdAt: string;
};

export type ContactWhatsappIdentity = {
  id: string;
  whatsappContactId: string;
  whatsappAccountId: string;
  externalContactId: string;
  phoneNumber: string | null;
  displayName: string | null;
  createdAt: string;
};

export type Contact = {
  id: string;
  displayName: string;
  phoneNumber: string | null;
  notes: string | null;
  roles: ContactRoleAssignment[];
  whatsappIdentities: ContactWhatsappIdentity[];
  createdAt: string;
  updatedAt: string;
};

export type CreateContactRequest = {
  displayName: string;
  notes?: string;
  phoneNumber?: string;
  roles?: ContactRole[];
  whatsappExternalContactIds?: string[];
};

export type UpdateContactRequest = {
  displayName?: string;
  notes?: string | null;
  phoneNumber?: string | null;
  roles?: ContactRole[];
  whatsappExternalContactIds?: string[];
};

export type {
  CreateProductRequest,
  Product,
  ProductOwnerType,
  ProductStatus,
  StockStatus,
  UpdateProductRequest,
} from './product-types';

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

export type OrderLineItemRequest = {
  currency?: string;
  productId?: string | null;
  quantity?: number;
  title: string;
  unitAmountMinor?: number | null;
};

export type CreateOrderRequest = {
  agentContactId?: string | null;
  currency?: string;
  customerContactId?: string | null;
  deliveryStatus?: DeliveryStatus;
  items: OrderLineItemRequest[];
  merchantContactId?: string | null;
  notes?: string | null;
  orderNumber: string;
  paymentStatus?: PaymentStatus;
  sourceBundleId?: string | null;
  status?: OrderStatus;
};

export type UpdateOrderRequest = {
  agentContactId?: string | null;
  currency?: string;
  customerContactId?: string | null;
  deliveryStatus?: DeliveryStatus;
  items?: OrderLineItemRequest[];
  merchantContactId?: string | null;
  notes?: string | null;
  orderNumber?: string;
  paymentStatus?: PaymentStatus;
  sourceBundleId?: string | null;
  status?: OrderStatus;
};

export type UpdateOrderStatusRequest = {
  status: OrderStatus;
};

export type {
  Commission,
  CommissionRecordType,
  CommissionStatus,
  CommissionType,
  CreateCommissionRequest,
  UpdateCommissionRequest,
} from './commission-types';

export type {
  CreateWhatsappAccountRequest,
  TrackedSource,
  TrackedSourceStatus,
  UpdateTrackedSourceRequest,
  WhatsappAccount,
  WhatsappAccountDetail,
  WhatsappAccountStatus,
  WhatsappChat,
  WhatsappMessage,
  WhatsappMessageChat,
  WhatsappMessageLinkedContact,
  WhatsappMessageSender,
  WhatsappMessageType,
  WhatsappSourceType,
} from './whatsapp-types';
