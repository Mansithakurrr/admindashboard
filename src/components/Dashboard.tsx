// src/components/Dashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { TicketsDataTable } from './TicketsDataTable';
import { columns } from '../app/dashboard/columns'; // Your column definitions
import { Ticket } from '@/types/ticket';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const DASHBOARD_TICKET_LIMIT = 10;

export default function Dashboard() {
  const [dashboardTickets, setDashboardTickets] = useState<Ticket[]>([]);
  const [totalTickets, setTotalTickets] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialTickets = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
        if (!baseUrl) throw new Error("API base URL is not configured");

        const res = await fetch(`${baseUrl}/api/tickets?page=1&limit=${DASHBOARD_TICKET_LIMIT}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || "Failed to fetch initial tickets");
        }
        const data = await res.json();
        
        setDashboardTickets(data.tickets || []);
        setTotalTickets(data.total || 0);

      } catch (err: any) {
        console.error("Error fetching initial tickets:", err);
        setError(err.message || "Failed to load tickets.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialTickets();
  }, []);

  // Calculate stats for the cards (can be based on dashboardTickets or a separate stats API call)
  const statsData = {
    Total: totalTickets, // Use the total count from API
    New: dashboardTickets.filter(t => t.status === 'New').length, // Or fetch dedicated stats
    Resolved: dashboardTickets.filter(t => t.status === 'Resolved').length,
    Closed: dashboardTickets.filter(t => t.status === 'Closed').length,
  };

  if (isLoading && dashboardTickets.length === 0) return <p className="p-4">Loading dashboard data...</p>;
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total" value={statsData.Total} />
        <StatCard title="New" value={statsData.New} />
        <StatCard title="Resolved" value={statsData.Resolved} />
        <StatCard title="Closed" value={statsData.Closed} />
      </div>

      <TicketsDataTable columns={columns} data={dashboardTickets} />

      {/* Link to All Tickets Page */}
      {totalTickets > DASHBOARD_TICKET_LIMIT && (
        <div className="text-center mt-6">
          <Button asChild variant="link">
            <Link href="/dashboard/allTickets">
              View All {totalTickets} Tickets &rarr;
            </Link>
          </Button>
        </div>
      )}
       {totalTickets === 0 && !isLoading && (
         <p className="text-center mt-6 text-gray-500">No tickets yet.</p>
       )}
    </div>
  );
}