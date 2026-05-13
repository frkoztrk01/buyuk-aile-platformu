import AdminLayout from '@/components/admin/AdminLayout';
import AdminContentEditor from '@/components/admin/AdminContentEditor';

export default function AdminNewEventPage() {
  return (
    <AdminLayout>
      <AdminContentEditor mode="create" contentKind="event" />
    </AdminLayout>
  );
}
