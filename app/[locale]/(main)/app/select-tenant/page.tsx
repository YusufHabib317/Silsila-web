import { setRequestLocale } from 'next-intl/server';

import { TenantSelector } from '@/components/auth/tenant-selector';

type SelectTenantPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function SelectTenantPage({
  params,
}: SelectTenantPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TenantSelector locale={locale} />;
}
