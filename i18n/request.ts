import { getRequestConfig, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';

import { routing } from './routing';

export async function loadMessages(locale: string) {
  return {
    common: (await import(`../locales/${locale}/common.json`)).default,
    error: (await import(`../locales/${locale}/error.json`)).default,
  };
}

export async function resolveLocale(params: Promise<{ locale: string }>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await loadMessages(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return { locale, messages, dir } as const;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
