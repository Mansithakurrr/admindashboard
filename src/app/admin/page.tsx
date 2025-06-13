// app/admin/page.tsx
import { redirect } from 'next/navigation'
import { getAdminFromToken } from '@/lib/auth'

export default function AdminPage() {
  const admin = getAdminFromToken(); // <- no args

  if (!admin) {
    redirect('/login');
  }

  return <div>Welcome, Admin!</div>;
}
