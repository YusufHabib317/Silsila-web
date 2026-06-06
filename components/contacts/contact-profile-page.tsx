'use client';

import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconUserCircle,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { getContact } from '@/lib/api/contacts';
import { getApiErrorMessage } from '@/lib/api/errors';
import { getWhatsappMessage, listWhatsappMessages } from '@/lib/api/whatsapp';
import type { Paginated, WhatsappMessage } from '@/lib/api/types';
import { useSessionStore } from '@/store/session';

import { InboxMessageDetailPanel } from '../inbox/inbox-message-detail-panel';
import { ContactMessageList, ContactSummary } from './contact-profile-panels';

const CONTACT_MESSAGE_PAGE_LIMIT = 50;

type ContactProfilePageProps = {
  contactId: string;
};

export function ContactProfilePage({ contactId }: ContactProfilePageProps) {
  const t = useTranslations('common.contacts');
  const inboxT = useTranslations('common.inbox');
  const router = useRouter();
  const selectedTenantId = useSessionStore((state) => state.selectedTenantId);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const contactQuery = useQuery({
    enabled: Boolean(selectedTenantId),
    queryFn: () => getContact(contactId),
    queryKey: ['contact', selectedTenantId, contactId],
  });
  const messagesQuery = useInfiniteQuery<
    Paginated<WhatsappMessage>,
    Error,
    InfiniteData<Paginated<WhatsappMessage>>,
    ['contactWhatsappMessages', string | null, string],
    string | null
  >({
    enabled: Boolean(selectedTenantId),
    getNextPageParam: (lastPage) =>
      lastPage.pageInfo.hasMore ? lastPage.pageInfo.nextCursor : undefined,
    initialPageParam: null,
    queryFn: ({ pageParam }) =>
      listWhatsappMessages({
        contactId,
        cursor: pageParam,
        limit: CONTACT_MESSAGE_PAGE_LIMIT,
      }),
    queryKey: ['contactWhatsappMessages', selectedTenantId, contactId],
  });
  const detailQuery = useQuery({
    enabled: Boolean(activeMessageId),
    queryFn: () => {
      if (!activeMessageId) {
        throw new Error(inboxT('errors.messageIdMissing'));
      }

      return getWhatsappMessage(activeMessageId);
    },
    queryKey: ['whatsappMessage', selectedTenantId, activeMessageId],
  });
  const messages = useMemo(
    () => messagesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [messagesQuery.data],
  );

  if (!selectedTenantId) {
    return (
      <Alert color="yellow" icon={<IconAlertTriangle size={18} />}>
        {t('empty.selectTenant')}
      </Alert>
    );
  }

  if (contactQuery.isPending) {
    return (
      <Box py="xl" ta="center">
        <Loader />
      </Box>
    );
  }

  if (contactQuery.error) {
    return (
      <Alert color="red" icon={<IconAlertTriangle size={18} />}>
        {getApiErrorMessage(contactQuery.error)}
      </Alert>
    );
  }

  if (!contactQuery.data) {
    return null;
  }

  return (
    <Stack gap="xl">
      <Group align="flex-start" justify="space-between">
        <Stack gap={4}>
          <Group gap="sm">
            <ThemeIcon color="teal" radius="sm" variant="light">
              <IconUserCircle size={18} />
            </ThemeIcon>
            <Title order={1} size="h2">
              {contactQuery.data.displayName}
            </Title>
          </Group>
          <Text c="dimmed" size="sm">
            {t('profile.subtitle')}
          </Text>
        </Stack>
        <Button
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => router.push('/app/contacts')}
          variant="light"
        >
          {t('actions.backToContacts')}
        </Button>
      </Group>

      <ContactSummary contact={contactQuery.data} />

      <Grid align="stretch">
        <Grid.Col span={{ base: 12, xl: 7 }}>
          <Paper p="lg" radius="sm" withBorder>
            <Stack gap="md">
              <Group justify="space-between" wrap="wrap">
                <Stack gap={2}>
                  <Title order={2} size="h4">
                    {t('profile.messagesTitle')}
                  </Title>
                  <Text c="dimmed" size="sm">
                    {t('list.loaded', { count: messages.length })}
                  </Text>
                </Stack>
                <Button
                  loading={messagesQuery.isRefetching}
                  onClick={() => void messagesQuery.refetch()}
                  variant="light"
                >
                  {t('actions.refresh')}
                </Button>
              </Group>

              <ContactMessageList
                activeMessageId={activeMessageId}
                error={messagesQuery.error}
                hasNextPage={Boolean(messagesQuery.hasNextPage)}
                isFetchingNextPage={messagesQuery.isFetchingNextPage}
                isPending={messagesQuery.isPending}
                messages={messages}
                onLoadMore={() => void messagesQuery.fetchNextPage()}
                onMessageSelect={setActiveMessageId}
              />
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, xl: 5 }}>
          <InboxMessageDetailPanel
            error={detailQuery.error}
            isPending={detailQuery.isPending && Boolean(activeMessageId)}
            message={detailQuery.data ?? null}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
