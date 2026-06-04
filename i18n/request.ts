import { getRequestConfig, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { cookies } from 'next/headers';

import { LocaleCookie } from '@/data';

import { routing } from './routing';

export async function loadMessages(locale: string) {
  return {
    common: (await import(`../locales/${locale}/common.json`)).default,
    error: (await import(`../locales/${locale}/error.json`)).default,
  };
}

export async function getCookieLocale() {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LocaleCookie)?.value;

  return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}

export async function resolveCookieLocale() {
  const locale = await getCookieLocale();
  setRequestLocale(locale);

  const messages = await loadMessages(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return { locale, messages, dir } as const;
}

export default getRequestConfig(async () => {
  const locale = await getCookieLocale();

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
