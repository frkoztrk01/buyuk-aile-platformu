import AdminLayout from '@/components/admin/AdminLayout';
import AdminMeetingsEditor from '@/components/admin/AdminMeetingsEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditMeetingPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <AdminLayout>
      <AdminMeetingsEditor mode="edit" meetingId={id} />
    </AdminLayout>
  );
}
