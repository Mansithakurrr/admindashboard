// src/app/dashboard/page.tsx

import { cookies } from "next/headers";
import { getAdminFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  const admin = token ? getAdminFromToken(token) : null;

  if (!admin) {
    redirect("/login");
  }

  return <Dashboard />;
}
