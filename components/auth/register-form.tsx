'use client';

import {
  Anchor,
  Button,
  Group,
  PasswordInput,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm, hasLength, isEmail, isNotEmpty } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconUserPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { register } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ensureCsrfToken } from '@/lib/api/session-token';
import { buildRoute } from '@/data/routes';
import { useSessionStore } from '@/store/session';

type RegisterFormProps = {
  locale: string;
};

export function RegisterForm({ locale }: RegisterFormProps) {
  const router = useRouter();
  const setAuth = useSessionStore((state) => state.setAuth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      displayName: '',
      email: '',
      password: '',
      tenantName: '',
    },
    validate: {
      displayName: isNotEmpty('Display name is required'),
      email: isEmail('Enter a valid email address'),
      password: hasLength({ min: 10 }, 'Password needs at least 10 characters'),
      tenantName: isNotEmpty('Tenant name is required'),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setIsSubmitting(true);

    try {
      await ensureCsrfToken();
      const response = await register(values);
      setAuth(response);
      router.replace(buildRoute(locale, '/app'));
    } catch (error) {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: 'Registration failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Paper
      component="section"
      radius="sm"
      shadow="0 24px 60px rgba(15, 23, 42, 0.12)"
      p={{ base: 'lg', sm: 'xl' }}
      withBorder
    >
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={1} size="h2">
            Create workspace
          </Title>
          <Text c="dimmed" size="sm">
            Start with one tenant and a secure cookie session.
          </Text>
        </Stack>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              autoComplete="name"
              label="Display name"
              placeholder="Store owner"
              {...form.getInputProps('displayName')}
            />
            <TextInput
              autoComplete="organization"
              label="Tenant name"
              placeholder="Silsila Shop"
              {...form.getInputProps('tenantName')}
            />
            <TextInput
              autoComplete="email"
              label="Email"
              placeholder="owner@example.com"
              type="email"
              {...form.getInputProps('email')}
            />
            <PasswordInput
              autoComplete="new-password"
              label="Password"
              placeholder="At least 10 characters"
              {...form.getInputProps('password')}
            />
            <Button
              leftSection={<IconUserPlus size={18} />}
              loading={isSubmitting}
              type="submit"
            >
              Create account
            </Button>
          </Stack>
        </form>

        <Group gap={6} justify="center">
          <Text c="dimmed" size="sm">
            Already registered?
          </Text>
          <Anchor
            component={Link}
            href={buildRoute(locale, '/login')}
            size="sm"
          >
            Sign in
          </Anchor>
        </Group>
      </Stack>
    </Paper>
  );
}
