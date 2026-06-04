import { setRequestLocale } from 'next-intl/server';

import { AuthScreen } from '@/components/auth/auth-screen';
import { RegisterForm } from '@/components/auth/register-form';

type RegisterPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <AuthScreen eyebrow="Tenant setup">
      <RegisterForm locale={locale} />
    </AuthScreen>
  );
}
