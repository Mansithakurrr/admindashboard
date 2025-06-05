import React from "react";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex flex-col p-4 bg-gray-100">{children}</main>
    </div>
  );
}
