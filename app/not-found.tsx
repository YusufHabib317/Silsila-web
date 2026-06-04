import '@mantine/core/styles.css';
import './globals.css';

import { cookies } from 'next/headers';
import { Cairo, Inter } from 'next/font/google';
import { mantineHtmlProps } from '@mantine/core';
import { NextIntlClientProvider } from 'next-intl';

import { NotFoundScreen } from '@/components/common/not-found';
import { Providers } from '@/components/common/provider/provider';
import { PublicNav } from '@/components/common/public-nav';
import { defaultLocale, LocaleCookie } from '@/data';
import { routing } from '@/i18n/routing';
import { loadMessages } from '@/i18n/request';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  display: 'swap',
  variable: '--font-cairo',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default async function RootNotFound() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LocaleCookie)?.value;
  const locale =
    localeCookie && routing.locales.includes(localeCookie as 'en' | 'ar')
      ? localeCookie
      : defaultLocale;

  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const messages = await loadMessages(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      {...mantineHtmlProps}
      className={`${inter.variable} ${cairo.variable}`}
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers locale={locale}>
            <PublicNav />
            <main>
              <NotFoundScreen />
            </main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
