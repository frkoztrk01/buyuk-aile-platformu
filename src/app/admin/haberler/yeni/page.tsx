import AdminLayout from '@/components/admin/AdminLayout';
import AdminContentEditor from '@/components/admin/AdminContentEditor';

export default function AdminNewNewsPage() {
  return (
    <AdminLayout>
      <AdminContentEditor mode="create" />
    </AdminLayout>
  );
}
