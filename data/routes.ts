export function buildRoute(locale: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `/${locale}${normalizedPath}`;
}

export const ROUTES = {
  app: (locale: string) => buildRoute(locale, '/app'),
  login: (locale: string) => buildRoute(locale, '/login'),
  register: (locale: string) => buildRoute(locale, '/register'),
  selectTenant: (locale: string) => buildRoute(locale, '/app/select-tenant'),
} as const;

export const authPages = ['/login', '/register'];

export const PAGE_ROUTES = ['/app', '/app/select-tenant'] as const;
