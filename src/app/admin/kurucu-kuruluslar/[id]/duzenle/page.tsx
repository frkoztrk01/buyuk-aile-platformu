import AdminLayout from '@/components/admin/AdminLayout';
import AdminFoundersEditor from '@/components/admin/AdminFoundersEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditFounderPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <AdminLayout>
      <AdminFoundersEditor mode="edit" founderId={id} />
    </AdminLayout>
  );
}
