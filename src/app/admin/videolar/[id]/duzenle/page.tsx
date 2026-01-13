import AdminLayout from '@/components/admin/AdminLayout';
import AdminVideosEditor from '@/components/admin/AdminVideosEditor';

interface PageProps {
  params: {
    id: string;
  };
}

export default function AdminEditVideoPage({ params }: PageProps) {
  return (
    <AdminLayout>
      <AdminVideosEditor mode="edit" videoId={params.id} />
    </AdminLayout>
  );
}
