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
import { useForm, hasLength, isEmail } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconLogin2 } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { login } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/errors';
import { ensureCsrfToken } from '@/lib/api/session-token';
import { buildRoute } from '@/data/routes';
import { useSessionStore } from '@/store/session';

export function LoginForm() {
  const router = useRouter();
  const setAuth = useSessionStore((state) => state.setAuth);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    mode: 'controlled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: isEmail('Enter a valid email address'),
      password: hasLength({ min: 10 }, 'Password needs at least 10 characters'),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    setIsSubmitting(true);

    try {
      await ensureCsrfToken();
      const response = await login(values);
      setAuth(response);
      router.replace(
        buildRoute(
          response.tenants.length === 1 ? '/app' : '/app/select-tenant',
        ),
      );
    } catch (error) {
      notifications.show({
        color: 'red',
        message: getApiErrorMessage(error),
        title: 'Sign in failed',
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
            Sign in
          </Title>
          <Text c="dimmed" size="sm">
            Open your WhatsApp commerce workspace.
          </Text>
        </Stack>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              autoComplete="email"
              label="Email"
              placeholder="owner@example.com"
              type="email"
              {...form.getInputProps('email')}
            />
            <PasswordInput
              autoComplete="current-password"
              label="Password"
              placeholder="Your password"
              {...form.getInputProps('password')}
            />
            <Button
              leftSection={<IconLogin2 size={18} />}
              loading={isSubmitting}
              type="submit"
            >
              Sign in
            </Button>
          </Stack>
        </form>

        <Group gap={6} justify="center">
          <Text c="dimmed" size="sm">
            New tenant?
          </Text>
          <Anchor component={Link} href={buildRoute('/register')} size="sm">
            Create account
          </Anchor>
        </Group>
      </Stack>
    </Paper>
  );
}
