// src/app/dashboard/page.tsx

import { getAdminSession } from "@/lib/getAdminSession";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";

export default async function DashboardPage() {
  const admin = await getAdminSession();

  if (!admin) {
    redirect("/login");
  }

  return <Dashboard />;
}
