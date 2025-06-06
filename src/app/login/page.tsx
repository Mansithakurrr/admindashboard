import AdminLoginForm from "@/components/AdminLoginForm";
import { getAdminFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function AdminLoginPage() {

    const admin = getAdminFromToken();

    if (admin) {
        redirect("/dashboard");
    }
  return <AdminLoginForm />;
}
