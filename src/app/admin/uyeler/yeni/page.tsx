import AdminLayout from '@/components/admin/AdminLayout';
import AdminMembersEditor from '@/components/admin/AdminMembersEditor';

export default function AdminNewMemberPage() {
  return (
    <AdminLayout>
      <AdminMembersEditor mode="create" />
    </AdminLayout>
  );
}
