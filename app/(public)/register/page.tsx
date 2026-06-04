import { AuthScreen } from '@/components/auth/auth-screen';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <AuthScreen eyebrow="Tenant setup">
      <RegisterForm />
    </AuthScreen>
  );
}
