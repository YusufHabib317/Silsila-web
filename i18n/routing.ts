import { defineRouting } from 'next-intl/routing';

import { defaultLocale, LocaleCookie } from '@/data';

export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale,
  localePrefix: 'as-needed',
  localeCookie: {
    name: LocaleCookie,
    maxAge: 60 * 60 * 24 * 365, // 1 year
  },
});
