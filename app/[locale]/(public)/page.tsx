import { setRequestLocale } from 'next-intl/server';

import { HomePage } from '@/components/landing/home';
import { SUPPORTED_LOCALES } from '@/data';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomePage />;
}
