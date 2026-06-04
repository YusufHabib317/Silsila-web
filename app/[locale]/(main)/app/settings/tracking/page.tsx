import { setRequestLocale } from 'next-intl/server';

import { TrackingSettings } from '@/components/tracking/tracking-settings';

type TrackingSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TrackingSettingsPage({
  params,
}: TrackingSettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <TrackingSettings />;
}
