'use client';

import {
  AppShell,
  Badge,
  Box,
  Burger,
  Button,
  Group,
  Loader,
  NavLink,
  Select,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconBrandWhatsapp,
  IconBriefcase,
  IconBuildingStore,
  IconLogout,
  IconMessageCircle,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { logout } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ensureCsrfToken } from '@/lib/api/session-token';
import { useSessionBootstrap } from '@/hooks/use-session-bootstrap';
import { useSessionStore } from '@/store/session';

type ProtectedAppShellProps = {
  children: React.ReactNode;
  locale: string;
};

type AppLocale = 'en' | 'ar';

const NAV_ITEMS = [
  { href: '/app', icon: IconBuildingStore, labelKey: 'dashboard' },
  { href: '/app/inbox', icon: IconMessageCircle, labelKey: 'inbox' },
  { href: '/app/orders', icon: IconBriefcase, labelKey: 'orders' },
  {
    href: '/app/settings/whatsapp',
    icon: IconBrandWhatsapp,
    labelKey: 'whatsapp',
  },
];

function FullScreenState({ label }: { label: string }) {
  return (
    <Box
      style={{
        alignItems: 'center',
        display: 'grid',
        minHeight: '100vh',
        placeItems: 'center',
      }}
    >
      <Stack align="center" gap="sm">
        <Loader />
        <Text c="dimmed">{label}</Text>
      </Stack>
    </Box>
  );
}

export function ProtectedAppShell({
  children,
  locale,
}: ProtectedAppShellProps) {
  const t = useTranslations('common.appShell');
  useSessionBootstrap();

  const [isNavbarOpened, { close: closeNavbar, toggle: toggleNavbar }] =
    useDisclosure();
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useSessionStore((state) => state.clearAuth);
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const selectTenant = useSessionStore((state) => state.selectTenant);
  const status = useSessionStore((state) => state.status);
  const tenants = useSessionStore((state) => state.tenants);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const tenantOptions = useMemo(
    () => tenants.map((tenant) => ({ label: tenant.name, value: tenant.id })),
    [tenants],
  );
  const languageOptions = useMemo(
    () => [
      { label: t('languages.en'), value: 'en' },
      { label: t('languages.ar'), value: 'ar' },
    ],
    [t],
  );

  const selectedTenant = tenants.find(
    (tenant) => tenant.id === selectedTenantId,
  );
  const isTenantSelectionRoute = pathname.endsWith('/app/select-tenant');

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace('/login');
    }
  }, [router, status]);

  useEffect(() => {
    if (
      status === 'authenticated' &&
      tenants.length > 1 &&
      !selectedTenantId &&
      !isTenantSelectionRoute
    ) {
      router.replace('/app/select-tenant');
    }
  }, [isTenantSelectionRoute, router, selectedTenantId, status, tenants]);

  function handleLocaleChange(value: string | null) {
    if (!value || value === locale) {
      return;
    }

    router.replace(pathname, { locale: value as AppLocale });
  }

  async function handleLogout() {
    setIsSigningOut(true);

    try {
      await ensureCsrfToken();
      await logout();
    } catch (error) {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: t('logoutFailed'),
      });
    } finally {
      clearAuth();
      router.replace('/login');
      setIsSigningOut(false);
    }
  }

  if (status === 'idle' || status === 'loading') {
    return <FullScreenState label={t('loadingWorkspace')} />;
  }

  if (status !== 'authenticated') {
    return <FullScreenState label={t('openingSignIn')} />;
  }

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        breakpoint: 'sm',
        collapsed: { mobile: !isNavbarOpened },
        width: 260,
      }}
      padding="md"
      styles={{
        main: { background: '#f7f9fb' },
        navbar: { background: '#ffffff' },
      }}
    >
      <AppShell.Header>
        <Group h="100%" justify="space-between" px="md" wrap="nowrap">
          <Group gap="sm" wrap="nowrap">
            <Burger
              aria-label={t('toggleNavigation')}
              hiddenFrom="sm"
              onClick={toggleNavbar}
              opened={isNavbarOpened}
              size="sm"
            />
            <Title order={2} size="h3">
              Silsila
            </Title>
            {selectedTenant ? (
              <Badge variant="light">{selectedTenant.role}</Badge>
            ) : null}
          </Group>
          <Group gap="sm" wrap="nowrap">
            <Select
              aria-label={t('language')}
              data={languageOptions}
              onChange={handleLocaleChange}
              value={locale}
              w={116}
            />
            <Select
              aria-label={t('tenant')}
              data={tenantOptions}
              onChange={(value) => {
                if (value) {
                  selectTenant(value);
                }
              }}
              value={selectedTenantId}
              w={220}
            />
            <Button
              leftSection={<IconLogout size={18} />}
              loading={isSigningOut}
              onClick={handleLogout}
              variant="subtle"
            >
              {t('logout')}
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.href}
                active={pathname === item.href}
                component={Link}
                href={item.href}
                label={t(`nav.${item.labelKey}`)}
                leftSection={<Icon size={18} />}
                onClick={closeNavbar}
              />
            );
          })}
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
