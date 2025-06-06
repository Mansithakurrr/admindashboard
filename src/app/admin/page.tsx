import { getAdminFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function AdminPage() {
  const admin = getAdminFromToken();

  if (!admin) {
    redirect("/login");
  }

  return <div>Welcome, Admin!</div>;
}
