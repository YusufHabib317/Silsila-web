import { setRequestLocale } from 'next-intl/server';

import { ProtectedAppShell } from '@/components/app-shell/protected-app-shell';

export default async function MainLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ProtectedAppShell locale={locale}>{children}</ProtectedAppShell>;
}
