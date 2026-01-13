import AdminLayout from '@/components/admin/AdminLayout';
import AdminNewsList from '@/components/admin/AdminNewsList';

export default function AdminNewsPage() {
  return (
    <AdminLayout>
      <AdminNewsList />
    </AdminLayout>
  );
}
