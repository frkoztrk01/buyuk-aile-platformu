import AdminLayout from '@/components/admin/AdminLayout';
import AdminMeetingsEditor from '@/components/admin/AdminMeetingsEditor';

export default function AdminNewMeetingPage() {
  return (
    <AdminLayout>
      <AdminMeetingsEditor mode="create" />
    </AdminLayout>
  );
}
