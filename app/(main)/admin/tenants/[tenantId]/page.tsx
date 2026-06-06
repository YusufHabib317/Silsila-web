import { AdminTenantDetailPage } from '@/components/admin/admin-tenant-detail-page';

type AdminTenantDetailRoutePageProps = {
  params: Promise<{
    tenantId: string;
  }>;
};

export default async function AdminTenantDetailRoutePage({
  params,
}: AdminTenantDetailRoutePageProps) {
  const { tenantId } = await params;

  return <AdminTenantDetailPage tenantId={tenantId} />;
}
