import AdminLayout from '@/components/admin/AdminLayout';
import AdminVideosEditor from '@/components/admin/AdminVideosEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditVideoPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <AdminLayout>
      <AdminVideosEditor mode="edit" videoId={id} />
    </AdminLayout>
  );
}
