import { redirect } from 'next/navigation';

import { buildRoute } from '@/data/routes';

export default function RootPage() {
  redirect(buildRoute('/login'));
}
