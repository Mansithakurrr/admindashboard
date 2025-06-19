// src/lib/getAdminSession.ts
import { cookies } from "next/headers";
import { getAdminFromToken } from "@/lib/auth";

export async function getAdminSession() {
  const token = (await cookies()).get("token")?.value;
  return token ? getAdminFromToken(token) : null;
}
