'use client';

import { Group, Select, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import type { WhatsappAccount, WhatsappChat } from '@/lib/api/types';
import { getAccountLabel } from '@/components/whatsapp/whatsapp-ui';
import { getChatLabel } from '@/components/tracking/tracking-ui';

import {
  type BooleanFilter,
  INBOX_FILTER_ALL,
  MESSAGE_TYPE_FILTER_OPTIONS,
  type MessageTypeFilter,
} from './inbox-ui';

type InboxMessageFiltersProps = {
  accountFilter: string;
  accounts: WhatsappAccount[];
  archivedFilter: BooleanFilter;
  chatFilter: string;
  chats: WhatsappChat[];
  linkedFilter: BooleanFilter;
  messageTypeFilter: MessageTypeFilter;
  onAccountFilterChange: (accountId: string) => void;
  onArchivedFilterChange: (value: BooleanFilter) => void;
  onChatFilterChange: (chatId: string) => void;
  onLinkedFilterChange: (value: BooleanFilter) => void;
  onMessageTypeFilterChange: (value: MessageTypeFilter) => void;
  onPersonalFilterChange: (value: BooleanFilter) => void;
  onSearchChange: (search: string) => void;
  onTrackedFilterChange: (value: BooleanFilter) => void;
  personalFilter: BooleanFilter;
  search: string;
  trackedFilter: BooleanFilter;
};

function buildSelectData(
  options: Array<{ labelKey: string; value: string }>,
  translate: (key: string) => string,
) {
  return options.map((option) => ({
    label: translate(option.labelKey),
    value: option.value,
  }));
}

function buildBooleanData(
  allLabel: string,
  trueLabel: string,
  falseLabel: string,
) {
  return [
    { label: allLabel, value: INBOX_FILTER_ALL },
    { label: trueLabel, value: 'true' },
    { label: falseLabel, value: 'false' },
  ];
}

export function InboxMessageFilters({
  accountFilter,
  accounts,
  archivedFilter,
  chatFilter,
  chats,
  linkedFilter,
  messageTypeFilter,
  onAccountFilterChange,
  onArchivedFilterChange,
  onChatFilterChange,
  onLinkedFilterChange,
  onMessageTypeFilterChange,
  onPersonalFilterChange,
  onSearchChange,
  onTrackedFilterChange,
  personalFilter,
  search,
  trackedFilter,
}: InboxMessageFiltersProps) {
  const t = useTranslations('common.inbox');
  const messageTypeOptions = useMemo(
    () => buildSelectData(MESSAGE_TYPE_FILTER_OPTIONS, t),
    [t],
  );
  const accountOptions = useMemo(
    () => [
      { label: t('filters.allAccounts'), value: INBOX_FILTER_ALL },
      ...accounts.map((account) => ({
        label: getAccountLabel(account, t('account.unnamed')),
        value: account.id,
      })),
    ],
    [accounts, t],
  );
  const chatOptions = useMemo(
    () => [
      { label: t('filters.allChats'), value: INBOX_FILTER_ALL },
      ...chats.map((chat) => ({
        label: getChatLabel(chat, t('message.unknownChat')),
        value: chat.id,
      })),
    ],
    [chats, t],
  );

  return (
    <>
      <Group align="flex-end" gap="sm" wrap="wrap">
        <Select
          allowDeselect={false}
          data={accountOptions}
          label={t('filters.account')}
          onChange={(value) => onAccountFilterChange(value ?? INBOX_FILTER_ALL)}
          value={accountFilter}
          w={190}
        />
        <Select
          allowDeselect={false}
          data={chatOptions}
          label={t('filters.chat')}
          onChange={(value) => onChatFilterChange(value ?? INBOX_FILTER_ALL)}
          value={chatFilter}
          w={210}
        />
        <Select
          allowDeselect={false}
          data={messageTypeOptions}
          label={t('filters.messageType')}
          onChange={(value) =>
            onMessageTypeFilterChange(
              (value as MessageTypeFilter | null) ?? INBOX_FILTER_ALL,
            )
          }
          value={messageTypeFilter}
          w={170}
        />
        <TextInput
          label={t('filters.search')}
          leftSection={<IconSearch size={16} />}
          onChange={(event) => onSearchChange(event.currentTarget.value)}
          placeholder={t('filters.searchPlaceholder')}
          value={search}
          w={220}
        />
      </Group>

      <Group align="flex-end" gap="sm" wrap="wrap">
        <Select
          allowDeselect={false}
          data={buildBooleanData(
            t('filters.allTracked'),
            t('filters.tracked'),
            t('filters.untracked'),
          )}
          label={t('filters.trackedState')}
          onChange={(value) =>
            onTrackedFilterChange(
              (value as BooleanFilter | null) ?? INBOX_FILTER_ALL,
            )
          }
          value={trackedFilter}
          w={160}
        />
        <Select
          allowDeselect={false}
          data={buildBooleanData(
            t('filters.allLinked'),
            t('filters.linked'),
            t('filters.unlinked'),
          )}
          label={t('filters.linkedState')}
          onChange={(value) =>
            onLinkedFilterChange(
              (value as BooleanFilter | null) ?? INBOX_FILTER_ALL,
            )
          }
          value={linkedFilter}
          w={160}
        />
        <Select
          allowDeselect={false}
          data={buildBooleanData(
            t('filters.allArchived'),
            t('filters.archived'),
            t('filters.active'),
          )}
          label={t('filters.archivedState')}
          onChange={(value) =>
            onArchivedFilterChange(
              (value as BooleanFilter | null) ?? INBOX_FILTER_ALL,
            )
          }
          value={archivedFilter}
          w={160}
        />
        <Select
          allowDeselect={false}
          data={buildBooleanData(
            t('filters.allPersonal'),
            t('filters.personal'),
            t('filters.business'),
          )}
          label={t('filters.personalState')}
          onChange={(value) =>
            onPersonalFilterChange(
              (value as BooleanFilter | null) ?? INBOX_FILTER_ALL,
            )
          }
          value={personalFilter}
          w={160}
        />
      </Group>
    </>
  );
}
