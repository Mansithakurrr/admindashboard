// src/app/dashboard/layout.tsx
import React from "react";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import "../globals.css";
import { getAdminSession } from "@/lib/getAdminSession";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminSession();

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
