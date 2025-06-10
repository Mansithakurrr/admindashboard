import React from "react";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";
import "../globals.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // This div fills the screen height and arranges Navbar and <main> vertically.
    <div className="flex flex-col h-screen">
      <Navbar />
      {/* This <main> tag will take up all remaining vertical space and will not scroll itself. */}
      <main className="flex-1 bg-gray-100 p-4">
        {children} {/* Children (like your Dashboard.tsx) will fill this area */}
      </main>
      <Toaster />
    </div>
  );
}
