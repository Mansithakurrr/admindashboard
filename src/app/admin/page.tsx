// app/admin/page.tsx
import { redirect } from 'next/navigation'
import { getAdminFromToken } from '@/lib/auth'
import { cookies } from 'next/headers'

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = (await cookieStore).get("token")?.value;
  const admin = token ? getAdminFromToken(token) : null;

  if (!admin) {
    redirect('/login');
  }

  return <div>Welcome, Admin!</div>;
}
