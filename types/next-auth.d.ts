export {};

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    deviceId?: string;
    expiresAt?: number;
    error?: 'RefreshAccessTokenError';
  }
}

declare module 'next-auth' {
  interface Session {
    clientId?: string;
    deviceId?: string;
    accessToken?: string;
    error?: 'RefreshAccessTokenError';
  }
}
