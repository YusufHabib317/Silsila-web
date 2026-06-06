import { ContactProfilePage } from '@/components/contacts/contact-profile-page';

type ContactProfileRoutePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ContactProfileRoutePage({
  params,
}: ContactProfileRoutePageProps) {
  const { id } = await params;

  return <ContactProfilePage contactId={id} />;
}
