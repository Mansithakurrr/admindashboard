// app/admin/page.tsx

import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/getAdminSession'

export default async function AdminPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect('/login');
  }
  return <div>Welcome, Admin!</div>;
}
