'use client';

import { Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertCircle,
  IconArchive,
  IconCircleCheck,
  IconInfoCircle,
  IconLock,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import type { ComponentType } from 'react';

type GuideItem = {
  color: string;
  descKey: string;
  icon: ComponentType<{ size?: number }>;
  titleKey: string;
};

const GUIDE_ITEMS: GuideItem[] = [
  {
    color: 'green',
    descKey: 'guide.trackedDesc',
    icon: IconCircleCheck,
    titleKey: 'status.tracked',
  },
  {
    color: 'gray',
    descKey: 'guide.ignoredDesc',
    icon: IconArchive,
    titleKey: 'status.ignored',
  },
  {
    color: 'yellow',
    descKey: 'guide.personalDesc',
    icon: IconLock,
    titleKey: 'status.personal',
  },
];

export function TrackingGuide() {
  const t = useTranslations('common.tracking');

  return (
    <Paper p="lg" radius="sm" withBorder>
      <Stack gap="md">
        <Stack gap={2}>
          <Text fw={700}>{t('guide.title')}</Text>
          <Text c="dimmed" size="sm">
            {t('guide.intro')}
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          {GUIDE_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <Stack gap={6} key={item.titleKey}>
                <ThemeIcon color={item.color} radius="sm" variant="light">
                  <Icon size={18} />
                </ThemeIcon>
                <Text fw={600} size="sm">
                  {t(item.titleKey)}
                </Text>
                <Text c="dimmed" size="sm">
                  {t(item.descKey)}
                </Text>
              </Stack>
            );
          })}
        </SimpleGrid>

        <Stack gap={6}>
          <Text c="dimmed" size="sm">
            <ThemeIcon
              color="orange"
              mr={6}
              size="sm"
              style={{ verticalAlign: 'middle' }}
              variant="light"
            >
              <IconAlertCircle size={14} />
            </ThemeIcon>
            {t('guide.needsReviewNote')}
          </Text>
          <Text c="dimmed" size="sm">
            <ThemeIcon
              color="blue"
              mr={6}
              size="sm"
              style={{ verticalAlign: 'middle' }}
              variant="light"
            >
              <IconInfoCircle size={14} />
            </ThemeIcon>
            {t('guide.sourceTypeNote')}
          </Text>
        </Stack>
      </Stack>
    </Paper>
  );
}
