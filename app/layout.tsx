import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './globals.css';

import { mantineHtmlProps } from '@mantine/core';
import { NextIntlClientProvider } from 'next-intl';
import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';

import { Providers } from '@/components/common/provider/provider';
import { resolveCookieLocale } from '@/i18n/request';

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

export const metadata: Metadata = {
  title: 'Silsila',
  icons: {
    icon: '/icon.svg',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, messages, dir } = await resolveCookieLocale();

  return (
    <html
      lang={locale}
      dir={dir}
      {...mantineHtmlProps}
      className={`${inter.variable} ${cairo.variable}`}
    >
      <body suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers locale={locale}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
