// // src/app/page.tsx
// import AdminLoginForm from "@/components/AdminLoginForm";
// import { redirect } from "next/navigation";

// export default function Home() {
//   return <AdminLoginForm />;
// }


import { cookies } from "next/headers";
import { getAdminFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function RootPage() {
  const token = cookies().get("token")?.value;
  const admin = token ? getAdminFromToken(token) : null;

  if (admin) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
