import { Box, Container, Stack, Text, Title } from '@mantine/core';

type AuthScreenProps = {
  children: React.ReactNode;
  eyebrow: string;
};

export function AuthScreen({ children, eyebrow }: AuthScreenProps) {
  return (
    <Box
      style={{
        background:
          'linear-gradient(135deg, #f8fafc 0%, #eef6f2 48%, #f5f7fb 100%)',
        minHeight: '100vh',
        padding: 'clamp(24px, 6vw, 72px) 16px',
      }}
    >
      <Container size={460}>
        <Stack gap="xl">
          <Stack gap={6} ta="center">
            <Text c="teal.8" fw={700} size="sm" tt="uppercase">
              {eyebrow}
            </Text>
            <Title order={2} size="h1">
              Silsila
            </Title>
          </Stack>
          {children}
        </Stack>
      </Container>
    </Box>
  );
}
