'use client';

import {
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconCheck, IconUsersGroup } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import { buildRoute } from '@/data/routes';
import { useSessionStore } from '@/store/session';

type TenantSelectorProps = {
  locale: string;
};

export function TenantSelector({ locale }: TenantSelectorProps) {
  const router = useRouter();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const selectTenant = useSessionStore((state) => state.selectTenant);
  const tenants = useSessionStore((state) => state.tenants);

  function handleSelectTenant(tenantId: string) {
    selectTenant(tenantId);
    router.replace(buildRoute(locale, '/app'));
  }

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Title order={1} size="h2">
          Select tenant
        </Title>
        <Text c="dimmed">Choose the workspace for this session.</Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 2 }}>
        {tenants.map((tenant) => {
          const isSelected = tenant.id === selectedTenantId;

          return (
            <Paper key={tenant.id} p="lg" radius="sm" withBorder>
              <Stack gap="md">
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <IconUsersGroup size={22} />
                    <Stack gap={0}>
                      <Text fw={700}>{tenant.name}</Text>
                      <Text c="dimmed" size="sm">
                        {tenant.slug}
                      </Text>
                    </Stack>
                  </Group>
                  {isSelected ? (
                    <Badge color="teal" leftSection={<IconCheck size={12} />}>
                      Selected
                    </Badge>
                  ) : null}
                </Group>

                <Group justify="space-between">
                  <Badge variant="light">{tenant.role}</Badge>
                  <Button
                    onClick={() => handleSelectTenant(tenant.id)}
                    variant={isSelected ? 'filled' : 'light'}
                  >
                    Open
                  </Button>
                </Group>
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
