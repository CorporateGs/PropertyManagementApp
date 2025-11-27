import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // Uncomment to enforce admin auth
  /*
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login');
  }
  */

  return <AdminDashboard />;
}
