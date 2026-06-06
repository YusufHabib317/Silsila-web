import { CommissionCreatePage } from '@/components/commissions/commission-create-page';

type CommissionCreateRoutePageProps = {
  searchParams?: Promise<{
    orderId?: string | string[];
    productId?: string | string[];
  }>;
};

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

export default async function CommissionCreateRoutePage({
  searchParams,
}: CommissionCreateRoutePageProps) {
  const params = await searchParams;

  return (
    <CommissionCreatePage
      initialOrderId={getQueryValue(params?.orderId)}
      initialProductId={getQueryValue(params?.productId)}
    />
  );
}
