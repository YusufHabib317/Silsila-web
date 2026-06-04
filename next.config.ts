import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

import {
  SUPPORTED_LOCALES,
  defaultLocale,
  LocaleCookie,
} from "./data/constants";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "offlineCache",
          expiration: {
            maxEntries: 200,
          },
        },
      },
    ],
  },
});

const nonDefaultLocales = SUPPORTED_LOCALES.filter((l) => l !== defaultLocale);

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      ...nonDefaultLocales.map((locale) => ({
        source: "/",
        destination: `/${locale}`,
        permanent: false,
        has: [{ type: "cookie" as const, key: LocaleCookie, value: locale }],
      })),
      { source: `/${defaultLocale}`, destination: "/", permanent: false },
      {
        source: `/${defaultLocale}/:path*`,
        destination: "/:path*",
        permanent: false,
      },
    ];
  },
};

export default withNextIntl(withPWA(nextConfig));
