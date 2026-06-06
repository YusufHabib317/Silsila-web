'use client';

import { Alert, Paper, Stack, Table, Text, Title } from '@mantine/core';
import { useLocale, useTranslations } from 'next-intl';

import type { AdminTenantDetailResponse } from '@/lib/api/admin-types';

import { formatAdminDate, GenericStatusBadge } from './admin-ui';

const ADMIN_TRANSLATIONS = 'common.admin';
const DATE_NEVER_KEY = 'date.never';

export function TenantUsersTable({
  data,
}: {
  data: AdminTenantDetailResponse;
}) {
  const locale = useLocale();
  const t = useTranslations(ADMIN_TRANSLATIONS);

  return (
    <Paper p="lg" radius="sm" withBorder>
      <Stack gap="md">
        <Title order={2} size="h4">
          {t('tenantDetail.users.title')}
        </Title>
        {data.users.length === 0 ? (
          <Alert color="gray">{t('tenantDetail.users.empty')}</Alert>
        ) : (
          <Table.ScrollContainer minWidth={760}>
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('tenantDetail.users.user')}</Table.Th>
                  <Table.Th>{t('tenantDetail.users.role')}</Table.Th>
                  <Table.Th>{t('tenantDetail.users.status')}</Table.Th>
                  <Table.Th>{t('tenantDetail.users.created')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.users.map((user) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={700}>{user.displayName}</Text>
                        <Text c="dimmed" size="xs">
                          {user.email}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <GenericStatusBadge label={user.role} status="ok" />
                    </Table.Td>
                    <Table.Td>
                      <GenericStatusBadge
                        label={user.status}
                        status={user.status}
                      />
                    </Table.Td>
                    <Table.Td>
                      {formatAdminDate(
                        user.createdAt,
                        t(DATE_NEVER_KEY),
                        locale,
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Stack>
    </Paper>
  );
}

export function TenantWhatsappTable({
  data,
}: {
  data: AdminTenantDetailResponse;
}) {
  const locale = useLocale();
  const t = useTranslations(ADMIN_TRANSLATIONS);

  return (
    <Paper p="lg" radius="sm" withBorder>
      <Stack gap="md">
        <Title order={2} size="h4">
          {t('tenantDetail.whatsapp.title')}
        </Title>
        {data.whatsappAccounts.length === 0 ? (
          <Alert color="gray">{t('tenantDetail.whatsapp.empty')}</Alert>
        ) : (
          <Table.ScrollContainer minWidth={820}>
            <Table highlightOnHover verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('tenantDetail.whatsapp.account')}</Table.Th>
                  <Table.Th>{t('tenantDetail.whatsapp.status')}</Table.Th>
                  <Table.Th>{t('tenantDetail.whatsapp.connected')}</Table.Th>
                  <Table.Th>{t('tenantDetail.whatsapp.created')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.whatsappAccounts.map((account) => (
                  <Table.Tr key={account.id}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text fw={700}>
                          {account.displayName ??
                            account.phoneNumber ??
                            t('tenantDetail.whatsapp.unnamed')}
                        </Text>
                        <Text c="dimmed" size="xs">
                          {account.phoneNumber ?? account.id}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <GenericStatusBadge
                        label={account.status}
                        status={account.status}
                      />
                    </Table.Td>
                    <Table.Td>
                      {formatAdminDate(
                        account.lastConnectedAt,
                        t(DATE_NEVER_KEY),
                        locale,
                      )}
                    </Table.Td>
                    <Table.Td>
                      {formatAdminDate(
                        account.createdAt,
                        t(DATE_NEVER_KEY),
                        locale,
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Stack>
    </Paper>
  );
}
