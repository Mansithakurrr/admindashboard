// src/components/Navbar.tsx
import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left side: Brand/Logo */}
        <Link
          href="/dashboard"
          className="text-xl font-bold hover:text-gray-300"
        >
          HelpDesk
        </Link>

        {/* Right side: Navigation links (can be added later) */}
        <div>
          {/* Example: <Link href="/dashboard/profile" className="ml-4 hover:text-gray-300">Profile</Link> */}
          {/* Add other navbar items here */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
