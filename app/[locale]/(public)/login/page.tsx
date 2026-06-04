import { setRequestLocale } from 'next-intl/server';

import { AuthScreen } from '@/components/auth/auth-screen';
import { LoginForm } from '@/components/auth/login-form';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthScreen eyebrow="Commerce tracking">
      <LoginForm locale={locale} />
    </AuthScreen>
  );
}
