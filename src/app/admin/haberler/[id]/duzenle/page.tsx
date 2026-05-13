import AdminLayout from '@/components/admin/AdminLayout';
import AdminContentEditor from '@/components/admin/AdminContentEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditNewsPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <AdminLayout>
      <AdminContentEditor mode="edit" newsId={id} contentKind="news" />
    </AdminLayout>
  );
}
