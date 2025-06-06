import React from "react";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex flex-col p-4 bg-gray-100">{children}</main>
      <Toaster />
    </div>
  );
}
