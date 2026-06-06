'use client';

import { Badge, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import type { TablerIcon } from '@tabler/icons-react';

type AdminPageHeaderProps = {
  badge: string;
  icon: TablerIcon;
  subtitle: string;
  title: string;
};

export function AdminPageHeader({
  badge,
  icon: Icon,
  subtitle,
  title,
}: AdminPageHeaderProps) {
  return (
    <Group align="flex-start" justify="space-between">
      <Stack gap={4}>
        <Group gap="sm">
          <ThemeIcon color="violet" radius="sm" variant="light">
            <Icon size={18} />
          </ThemeIcon>
          <Title order={1} size="h2">
            {title}
          </Title>
        </Group>
        <Text c="dimmed" size="sm">
          {subtitle}
        </Text>
      </Stack>
      <Badge color="violet" radius="sm" size="lg" variant="light">
        {badge}
      </Badge>
    </Group>
  );
}
