import { setRequestLocale } from 'next-intl/server';

import { InboxPage } from '@/components/inbox/inbox-page';

type InboxRoutePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function InboxRoutePage({ params }: InboxRoutePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <InboxPage />;
}
