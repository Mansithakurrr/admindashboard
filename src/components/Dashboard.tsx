// src/components/Dashboard.tsx
import React from 'react';
import StatCard from './StatCard';
import { TicketsDataTable } from './TicketsDataTable';
import { columns } from '../app/dashboard/columns';
import { recentTickets } from '@/lib/mockData'; // Import mock data

// This is now a simple, synchronous component again
const Dashboard = () => {
  // Calculate stats directly from the imported mock data
  const stats = {
    Total: recentTickets.length,
    New: recentTickets.filter(t => t.status === 'New').length,
    Resolved: recentTickets.filter(t => t.status === 'Resolved').length,
    Closed: recentTickets.filter(t => t.status === 'Closed').length,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total" value={stats.Total} />
        <StatCard title="New" value={stats.New} />
        <StatCard title="Resolved" value={stats.Resolved} />
        <StatCard title="Closed" value={stats.Closed} />
      </div>
      <TicketsDataTable columns={columns} data={recentTickets} />
    </div>
  );
};

export default Dashboard;