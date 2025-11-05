import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'vi'],
  defaultLocale: 'vi',
  localePrefix: 'always',
  localeDetection: true,
  localeCookie: {
    name: 'USER_LOCALE',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'none',
    secure: true,
  },
});
