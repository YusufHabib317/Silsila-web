import KeycloakProvider from 'next-auth/providers/keycloak';
import type { NextAuthOptions } from 'next-auth';

import { TOKEN_SECRET } from '@/data';
import { logout } from './sign-out';

const authLink = process.env.AUTH_LINK;
const keycloakClientId =
  process.env.KEYCLOAK_CLIENT_ID ?? process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID;
const keycloakClientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
const hasKeycloakConfig =
  Boolean(authLink) &&
  Boolean(keycloakClientId) &&
  Boolean(keycloakClientSecret);

const providers = hasKeycloakConfig
  ? [
      KeycloakProvider({
        clientId: keycloakClientId!,
        clientSecret: keycloakClientSecret!,
        issuer: authLink!,
      }),
    ]
  : [];

const secret =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  process.env.CLIENT_SECRET ??
  TOKEN_SECRET;

export const authOptions: NextAuthOptions = {
  secret,
  providers,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  jwt: {
    secret,
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      if (account?.refresh_token) {
        token.refreshToken = account.refresh_token;
      }
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.error) {
        session.error = token.error;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token) {
        logout(token);
      }
    },
  },
  pages: {
    signIn: '/auth/sign-in',
    error: '/api/auth/signin',
  },
};
