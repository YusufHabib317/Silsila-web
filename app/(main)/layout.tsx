import { getCookieLocale } from '@/i18n/request';
import { ProtectedAppShell } from '@/components/app-shell/protected-app-shell';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getCookieLocale();

  return <ProtectedAppShell locale={locale}>{children}</ProtectedAppShell>;
}
