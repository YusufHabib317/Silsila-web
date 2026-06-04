import { mantineHtmlProps } from '@mantine/core';
import { NextIntlClientProvider } from 'next-intl';
import { Cairo, Inter } from 'next/font/google';

import { Providers } from '@/components/common/provider/provider';
import { resolveLocale } from '@/i18n/request';

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

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function Layout({ children, params }: Props) {
  const { locale, messages, dir } = await resolveLocale(params);

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
