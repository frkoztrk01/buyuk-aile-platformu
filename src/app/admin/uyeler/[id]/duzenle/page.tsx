import AdminLayout from '@/components/admin/AdminLayout';
import AdminMembersEditor from '@/components/admin/AdminMembersEditor';

interface PageProps {
  params: {
    id: string;
  };
}

export default function AdminEditMemberPage({ params }: PageProps) {
  return (
    <AdminLayout>
      <AdminMembersEditor mode="edit" memberId={params.id} />
    </AdminLayout>
  );
}
