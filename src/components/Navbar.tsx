// src/components/Navbar.tsx
'use client';

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const Navbar = () => {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showConfirm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showConfirm]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
  
      if (res.ok) {
        toast.success("Logged out successfully");
        router.push("/login");
      } else {
        toast.error("Logout failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setShowConfirm(false);
    }
  };

  // const handleLogout = async () => {
  //   try {
  //     const res = await fetch("/api/auth/logout", { method: "POST" });
  //     if (res.ok) {
  //       router.push("/login");
  //     } else {
  //       console.error("Logout failed");
  //     }
  //   } catch (err) {
  //     console.error("Logout error:", err);
  //   }
  // };

  return (
    <>
      <nav className="bg-white sticky top-0 z-50 text-black p-4 shadow">
        <div className="container mx-auto flex items-center justify-between">
          {/* Left: Logo and Brand */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image
              src="/bpllogo.png"
              alt="Bigpluto logo"
              width={40}
              height={40}
              className="w-auto h-10"
            />
            <span className="text-xl font-bold">Help Desk</span>
          </Link>

          {/* Right: Links */}
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/tickets/submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Submit Ticket
            </Link>
            <button
              onClick={() => setShowConfirm(true)}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Confirm Logout Modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 id="logout-confirm-title" className="text-lg font-semibold mb-4">
              Confirm Logout
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
