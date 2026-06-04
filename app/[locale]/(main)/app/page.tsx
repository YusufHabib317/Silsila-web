import { setRequestLocale } from 'next-intl/server';

import { CommerceDashboardHome } from '@/components/commerce-home/dashboard-home';

type AppPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AppPage({ params }: AppPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CommerceDashboardHome />;
}
