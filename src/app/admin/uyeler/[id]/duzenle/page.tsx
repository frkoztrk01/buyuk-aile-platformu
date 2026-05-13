import AdminLayout from '@/components/admin/AdminLayout';
import AdminMembersEditor from '@/components/admin/AdminMembersEditor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditMemberPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <AdminLayout>
      <AdminMembersEditor mode="edit" memberId={id} />
    </AdminLayout>
  );
}
