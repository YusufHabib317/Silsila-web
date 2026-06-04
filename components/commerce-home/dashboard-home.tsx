'use client';

import {
  Badge,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconApi,
  IconShieldCheck,
  IconUsersGroup,
  IconWorld,
} from '@tabler/icons-react';

import { getApiBaseUrl } from '@/lib/api/env';
import { useSessionStore } from '@/store/session';

const STATUS_ITEMS = [
  {
    icon: IconApi,
    label: 'API client',
    value: 'Cookie + CSRF ready',
  },
  {
    icon: IconShieldCheck,
    label: 'Session',
    value: 'Protected routes active',
  },
  {
    icon: IconUsersGroup,
    label: 'Tenant header',
    value: 'x-tenant-id wired',
  },
  {
    icon: IconWorld,
    label: 'Backend origin',
    value: getApiBaseUrl(),
  },
];

export function CommerceDashboardHome() {
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const tenants = useSessionStore((state) => state.tenants);
  const user = useSessionStore((state) => state.user);
  const selectedTenant = tenants.find(
    (tenant) => tenant.id === selectedTenantId,
  );

  return (
    <Stack gap="xl">
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={4}>
          <Title order={1} size="h2">
            Dashboard
          </Title>
          <Text c="dimmed">{selectedTenant?.name ?? 'No tenant selected'}</Text>
        </Stack>
        {selectedTenant ? <Badge size="lg">{selectedTenant.role}</Badge> : null}
      </Group>

      <Paper p="lg" radius="sm" withBorder>
        <Group justify="space-between" wrap="wrap">
          <Stack gap={2}>
            <Text c="dimmed" size="sm">
              Signed in as
            </Text>
            <Text fw={700}>{user?.displayName ?? 'Unknown user'}</Text>
            <Text c="dimmed" size="sm">
              {user?.email ?? 'No email loaded'}
            </Text>
          </Stack>
          {selectedTenant ? (
            <Stack gap={2}>
              <Text c="dimmed" size="sm">
                Workspace
              </Text>
              <Text fw={700}>{selectedTenant.name}</Text>
              <Text c="dimmed" size="sm">
                {selectedTenant.slug}
              </Text>
            </Stack>
          ) : null}
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        {STATUS_ITEMS.map((item) => {
          const Icon = item.icon;

          return (
            <Paper key={item.label} p="lg" radius="sm" withBorder>
              <Stack gap="md">
                <ThemeIcon color="teal" radius="sm" size="lg" variant="light">
                  <Icon size={20} />
                </ThemeIcon>
                <Stack gap={2}>
                  <Text fw={700}>{item.label}</Text>
                  <Text c="dimmed" lineClamp={2} size="sm">
                    {item.value}
                  </Text>
                </Stack>
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
