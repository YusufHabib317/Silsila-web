'use client';

import {
  Group,
  Paper,
  Progress,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconBriefcase } from '@tabler/icons-react';

type StatCardProps = {
  color: string;
  icon: typeof IconBriefcase;
  isLoading: boolean;
  label: string;
  meta: string;
  value: string;
};

type MetricLineProps = {
  color: string;
  label: string;
  total: number;
  value: number;
};

function getPercent(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

export function StatCard({
  color,
  icon: Icon,
  isLoading,
  label,
  meta,
  value,
}: StatCardProps) {
  return (
    <Paper p="lg" radius="sm" withBorder>
      <Stack gap="md">
        <Group justify="space-between" wrap="nowrap">
          <ThemeIcon color={color} radius="sm" size="lg" variant="light">
            <Icon size={20} />
          </ThemeIcon>
          <Text c="dimmed" fw={700} size="xs" tt="uppercase">
            {label}
          </Text>
        </Group>
        <Stack gap={4}>
          {isLoading ? (
            <Skeleton h={34} radius="xs" w="70%" />
          ) : (
            <Text fw={800} size="xl">
              {value}
            </Text>
          )}
          {isLoading ? (
            <Skeleton h={16} radius="xs" w="90%" />
          ) : (
            <Text c="dimmed" lineClamp={1} size="sm">
              {meta}
            </Text>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

export function MetricLine({ color, label, total, value }: MetricLineProps) {
  const percent = getPercent(value, total);

  return (
    <Stack gap={6}>
      <Group justify="space-between" wrap="nowrap">
        <Text fw={600} size="sm">
          {label}
        </Text>
        <Text c="dimmed" size="sm">
          {percent}%
        </Text>
      </Group>
      <Progress color={color} radius="xs" size="sm" value={percent} />
    </Stack>
  );
}
