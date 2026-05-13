import AdminLayout from '@/components/admin/AdminLayout';
import AdminContentEditor from '@/components/admin/AdminContentEditor';

interface PageProps {
  params: {
    id: string;
  };
}

export default function AdminEditEventPage({ params }: PageProps) {
  return (
    <AdminLayout>
      <AdminContentEditor mode="edit" newsId={params.id} contentKind="event" />
    </AdminLayout>
  );
}
