// src/app/dashboard/layout.tsx
import React from "react";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import "../globals.css";
import { getAdminFromToken } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get("token")?.value;
  const admin = token ? getAdminFromToken(token) : null;

    if (!admin || admin.role !== "admin") {
      redirect("/unauthorized");
    }
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-100 p-4">{children}</main>
      <Toaster />
    </div>
  );
}
