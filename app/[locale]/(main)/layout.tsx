import { Box, Container } from '@mantine/core';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';

import styles from './layout.module.css';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/sign-in');
  }

  return (
    <Box className={styles.root}>
      <Box component="header" className={styles.header}></Box>
      <Box component="main" className={styles.main}>
        <Container size="xl">{children}</Container>
      </Box>
    </Box>
  );
}
