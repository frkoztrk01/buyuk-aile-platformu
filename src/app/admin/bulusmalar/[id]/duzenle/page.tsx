import AdminLayout from '@/components/admin/AdminLayout';
import AdminMeetingsEditor from '@/components/admin/AdminMeetingsEditor';

interface PageProps {
  params: {
    id: string;
  };
}

export default function AdminEditMeetingPage({ params }: PageProps) {
  return (
    <AdminLayout>
      <AdminMeetingsEditor mode="edit" meetingId={params.id} />
    </AdminLayout>
  );
}
