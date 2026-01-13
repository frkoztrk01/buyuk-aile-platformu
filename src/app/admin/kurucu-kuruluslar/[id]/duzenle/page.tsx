import AdminLayout from '@/components/admin/AdminLayout';
import AdminFoundersEditor from '@/components/admin/AdminFoundersEditor';

interface PageProps {
  params: {
    id: string;
  };
}

export default function AdminEditFounderPage({ params }: PageProps) {
  return (
    <AdminLayout>
      <AdminFoundersEditor mode="edit" founderId={params.id} />
    </AdminLayout>
  );
}
