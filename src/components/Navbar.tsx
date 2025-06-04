// src/components/Navbar.tsx
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-white text-black p-4">
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

          {/* Example future nav links: */}
          {/* <Link href="/dashboard/profile" className="hover:text-gray-600">Profile</Link> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
