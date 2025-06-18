'use client';

import React, { Suspense } from 'react';
export const dynamic = 'force-dynamic';

import UserTicketForm from '@/components/UserTicketForm';
export default function SupportPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="flex items-center space-x-2">
        <img src="/bpllogo.png" alt="Bigpluto logo" className="h-16 w-auto" />
        {/* <span className="text-xl font-bold">Help Desk</span> */}
      </div>
      <Suspense fallback={<div>Loading form...</div>}>
        <UserTicketForm />
      </Suspense>
    </main>
  );
}
