import { redirect } from 'next/navigation';

import { buildRoute } from '@/data/routes';
import { defaultLocale } from '@/data';

export default function RootPage() {
  redirect(buildRoute(defaultLocale, '/login'));
}
