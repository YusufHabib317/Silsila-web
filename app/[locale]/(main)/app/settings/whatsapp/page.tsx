import { setRequestLocale } from 'next-intl/server';

import { WhatsappSettings } from '@/components/whatsapp/whatsapp-settings';

type WhatsappSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function WhatsappSettingsPage({
  params,
}: WhatsappSettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <WhatsappSettings />;
}
