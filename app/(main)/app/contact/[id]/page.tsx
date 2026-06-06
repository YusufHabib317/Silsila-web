import { ContactProfilePage } from '@/components/contacts/contact-profile-page';

type ContactProfileAliasRoutePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ContactProfileAliasRoutePage({
  params,
}: ContactProfileAliasRoutePageProps) {
  const { id } = await params;

  return <ContactProfilePage contactId={id} />;
}
