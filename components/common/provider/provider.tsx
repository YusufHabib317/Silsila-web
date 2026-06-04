'use client';

import { DirectionProvider, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';

import { useState } from 'react';

import { usePwaInstallPromptCapture } from '@/hooks/use-pwa-install';
import { theme } from '@/theme';

interface ProvidersProps {
  children: React.ReactNode;
  locale: string;
}

export function Providers({ children, locale }: ProvidersProps) {
  usePwaInstallPromptCapture();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <DirectionProvider
          initialDirection={locale === 'ar' ? 'rtl' : 'ltr'}
          detectDirection={false}
        >
          <MantineProvider theme={theme} defaultColorScheme="light">
            <Notifications position="bottom-right" />
            {children}
          </MantineProvider>
        </DirectionProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
