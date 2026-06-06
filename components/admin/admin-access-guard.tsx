'use client';

import { Alert, Box, Loader, Stack, Text } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useSessionStore } from '@/store/session';

type AdminAccessGuardProps = {
  children: React.ReactNode;
};

export function AdminAccessGuard({ children }: AdminAccessGuardProps) {
  const t = useTranslations('common.admin');
  const router = useRouter();
  const isPlatformAdmin = useSessionStore((state) => state.isPlatformAdmin);
  const status = useSessionStore((state) => state.status);

  useEffect(() => {
    if (status === 'authenticated' && !isPlatformAdmin) {
      router.replace('/app');
    }
  }, [isPlatformAdmin, router, status]);

  if (status === 'idle' || status === 'loading') {
    return (
      <Box py="xl" ta="center">
        <Stack align="center" gap="sm">
          <Loader />
          <Text c="dimmed">{t('access.loading')}</Text>
        </Stack>
      </Box>
    );
  }

  if (!isPlatformAdmin) {
    return (
      <Alert color="red" icon={<IconLock size={18} />}>
        {t('access.denied')}
      </Alert>
    );
  }

  return children;
}
