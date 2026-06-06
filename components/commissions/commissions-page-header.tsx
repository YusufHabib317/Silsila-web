'use client';

import { Badge, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconReceipt } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export function CommissionsPageHeader() {
  const t = useTranslations('common.commissions');

  return (
    <Group align="flex-start" justify="space-between">
      <Stack gap={4}>
        <Group gap="sm">
          <ThemeIcon color="teal" radius="sm" variant="light">
            <IconReceipt size={18} />
          </ThemeIcon>
          <Title order={1} size="h2">
            {t('page.title')}
          </Title>
        </Group>
        <Text c="dimmed" size="sm">
          {t('page.subtitle')}
        </Text>
      </Stack>
      <Badge color="teal" radius="sm" size="lg" variant="light">
        {t('page.badge')}
      </Badge>
    </Group>
  );
}
