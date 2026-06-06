export type AdminTenantStatus = 'active' | 'trial' | 'disabled' | 'deleted';

export type AdminTenantPlan = 'free' | 'starter' | 'pro' | 'enterprise';

export type AdminTenantListItem = {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminTenantUser = {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  createdAt: string;
};

export type AdminTenantWhatsappAccount = {
  id: string;
  phoneNumber: string | null;
  displayName: string | null;
  status: string;
  lastConnectedAt: string | null;
  lastDisconnectedAt: string | null;
  createdAt: string;
};

export type AdminTenantCounts = {
  activeUsers: number;
  whatsappAccounts: number;
  products: number;
  orders: number;
  untrackedMessagesPendingDeletion: number;
  temporaryMediaObjects: number;
};

export type AdminTenantDetailResponse = {
  tenant: AdminTenantListItem;
  users: AdminTenantUser[];
  whatsappAccounts: AdminTenantWhatsappAccount[];
  counts: AdminTenantCounts;
};

export type AdminAuditLog = {
  id: string;
  tenantId: string | null;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type AdminSystemMetrics = {
  tenants: {
    total: number;
    byStatus: Record<string, number>;
  };
  whatsappAccounts: {
    total: number;
    byStatus: Record<string, number>;
  };
  messages: {
    receivedToday: number;
    trackedToday: number;
    expiredUntrackedPendingDeletion: number;
  };
  storage: {
    temporaryObjectCount: number;
    temporaryStorageBytes: number;
  };
  checkedAt: string;
};

export type AdminSystemHealth = {
  api: {
    status: string;
    service: string;
    checkedAt: string;
  };
  workers: {
    whatsapp: string;
    cleanup: string;
  };
  storage: {
    r2Configured: boolean;
    temporaryObjectCount: number;
    temporaryStorageBytes: number;
  };
  metrics: AdminSystemMetrics;
};
