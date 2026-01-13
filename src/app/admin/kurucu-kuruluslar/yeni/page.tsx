import AdminLayout from '@/components/admin/AdminLayout';
import AdminFoundersEditor from '@/components/admin/AdminFoundersEditor';

export default function AdminNewFounderPage() {
  return (
    <AdminLayout>
      <AdminFoundersEditor mode="create" />
    </AdminLayout>
  );
}
