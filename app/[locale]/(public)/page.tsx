import { setRequestLocale } from 'next-intl/server';

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

  return (
    <main
      style={{
        minHeight: 'calc(100vh - 4rem)',
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        padding: '4rem 1rem',
      }}
    >
      <div>
        <h1 style={{ marginBottom: '0.5rem' }}>
          Welcome to Silsila ({locale})
        </h1>
        <p>Homepage content is pending implementation.</p>
      </div>
    </main>
  );
}
