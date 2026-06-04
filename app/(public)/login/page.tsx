import { AuthScreen } from '@/components/auth/auth-screen';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <AuthScreen eyebrow="Commerce tracking">
      <LoginForm />
    </AuthScreen>
  );
}
