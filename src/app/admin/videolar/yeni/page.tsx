import AdminLayout from '@/components/admin/AdminLayout';
import AdminVideosEditor from '@/components/admin/AdminVideosEditor';

export default function AdminNewVideoPage() {
  return (
    <AdminLayout>
      <AdminVideosEditor mode="create" />
    </AdminLayout>
  );
}
