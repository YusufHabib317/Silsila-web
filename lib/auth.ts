import axios from 'axios';
import { cookies } from 'next/headers';
import KeycloakProvider from 'next-auth/providers/keycloak';
import type { JWT } from 'next-auth/jwt';
import type { NextAuthOptions } from 'next-auth';
import { TOKEN_SECRET } from '@/data';

const authLink = process.env.AUTH_LINK!;

interface TokenData {
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
}

export const authOptions: NextAuthOptions = {
  secret: TOKEN_SECRET ?? clientSecret,
  providers: [],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  jwt: {
    secret: TOKEN_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  callbacks: {
    async jwt({ token, user, account }) {},
    async session({ session, token }) {},
  },
  events: {
    async signOut({ token }) {
      if (token) {
        logout(token as TokenData);
      }
    },
  },
  pages: {
    signIn: '/auth/sign-in',
    error: '/api/auth/signin',
  },
};
