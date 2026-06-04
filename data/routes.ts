export function buildRoute(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

export const ROUTES = {
  app: () => buildRoute('/app'),
  login: () => buildRoute('/login'),
  register: () => buildRoute('/register'),
  selectTenant: () => buildRoute('/app/select-tenant'),
} as const;

export const authPages = ['/login', '/register'];

export const PAGE_ROUTES = ['/app', '/app/select-tenant'] as const;
