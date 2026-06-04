import { setRequestLocale } from 'next-intl/server';

type PublicLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <main>{children}</main>
    </>
  );
}
