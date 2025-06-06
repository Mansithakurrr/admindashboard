// import Dashboard from '@/components/Dashboard';

// const DashboardPage = () => {
//   return <Dashboard />;
// };

// export default DashboardPage;


import { getAdminFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  const admin = getAdminFromToken();

  if (!admin) {
    redirect("/login");
  }

  return <Dashboard />;
}
