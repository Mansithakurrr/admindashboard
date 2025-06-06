'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Navbar = () => {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <>
      <nav className="bg-white sticky top-0 z-50 text-black p-4 shadow">
        <div className="container mx-auto flex items-center justify-between">
          {/* Left side: Logo and Brand */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <img src="/bpllogo.png" alt="Bigpluto logo" className="h-10 w-auto" />
            <span className="text-xl font-bold">Help Desk</span>
          </Link>

          {/* Right side: Navigation links */}
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

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Logout</h2>
            <p className="text-sm text-gray-600 mb-6">Are you sure you want to logout?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
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
