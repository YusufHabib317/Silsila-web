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
  IconBriefcase,
  IconBuildingStore,
  IconLogout,
  IconMessageCircle,
  IconSettings,
} from '@tabler/icons-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { buildRoute } from '@/data/routes';
import { logout } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ensureCsrfToken } from '@/lib/api/session-token';
import { useSessionBootstrap } from '@/hooks/use-session-bootstrap';
import { useSessionStore } from '@/store/session';

type ProtectedAppShellProps = {
  children: React.ReactNode;
  locale: string;
};

const NAV_ITEMS = [
  { href: '/app', icon: IconBuildingStore, label: 'Dashboard' },
  { href: '/app/inbox', icon: IconMessageCircle, label: 'Inbox' },
  { href: '/app/orders', icon: IconBriefcase, label: 'Orders' },
  { href: '/app/settings/whatsapp', icon: IconSettings, label: 'Settings' },
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

  const selectedTenant = tenants.find(
    (tenant) => tenant.id === selectedTenantId,
  );
  const isTenantSelectionRoute = pathname.endsWith('/app/select-tenant');

  useEffect(() => {
    if (status === 'anonymous') {
      router.replace(buildRoute(locale, '/login'));
    }
  }, [locale, router, status]);

  useEffect(() => {
    if (
      status === 'authenticated' &&
      tenants.length > 1 &&
      !selectedTenantId &&
      !isTenantSelectionRoute
    ) {
      router.replace(buildRoute(locale, '/app/select-tenant'));
    }
  }, [
    isTenantSelectionRoute,
    locale,
    router,
    selectedTenantId,
    status,
    tenants,
  ]);

  async function handleLogout() {
    setIsSigningOut(true);

    try {
      await ensureCsrfToken();
      await logout();
    } catch (error) {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: 'Logout request failed',
      });
    } finally {
      clearAuth();
      router.replace(buildRoute(locale, '/login'));
      setIsSigningOut(false);
    }
  }

  if (status === 'idle' || status === 'loading') {
    return <FullScreenState label="Loading workspace" />;
  }

  if (status !== 'authenticated') {
    return <FullScreenState label="Opening sign in" />;
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
              aria-label="Toggle navigation"
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
              aria-label="Tenant"
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
              Logout
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const href = buildRoute(locale, item.href);

            return (
              <NavLink
                key={item.href}
                active={pathname === href}
                component={Link}
                href={href}
                label={item.label}
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
