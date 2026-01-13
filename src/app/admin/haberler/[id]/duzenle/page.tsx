import AdminLayout from '@/components/admin/AdminLayout';
import AdminContentEditor from '@/components/admin/AdminContentEditor';

interface PageProps {
  params: {
    id: string;
  };
}

export default function AdminEditNewsPage({ params }: PageProps) {
  return (
    <AdminLayout>
      <AdminContentEditor mode="edit" newsId={params.id} />
    </AdminLayout>
  );
}
