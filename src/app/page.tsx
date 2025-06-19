// src/app/page.tsx

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/getAdminSession";

export default async function RootPage() {
  const admin = await getAdminSession();
  redirect(admin ? "/dashboard" : "/login");
}
