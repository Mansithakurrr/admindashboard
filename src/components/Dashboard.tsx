// src/components/Dashboard.tsx
"use client";

import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import { TicketsDataTable } from './TicketsDataTable';
import { columns } from '../app/dashboard/columns'; // Your column definitions
import { Ticket } from '@/types/ticketTypes';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const DASHBOARD_TICKET_LIMIT = 10; // Changed back to 10 as per your original code

// Define a type for the stats object we expect from the API
type TicketStats = {
  total: number;
  open: number;
  resolved: number;
  closed: number;
  today: number;
  // Add other stats like 'new' if your API provides them
};

export default function Dashboard() {
  const [dashboardTickets, setDashboardTickets] = useState<Ticket[]>([]);
  // New state specifically for the card statistics
  const [statsData, setStatsData] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      // const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
      // if (!baseUrl) {
      //   setError("API base URL is not configured");
      //   setIsLoading(false);
      //   return;
      // }

      try {
        // Use Promise.all to fetch both sets of data concurrently
        const [ticketsResponse, statsResponse] = await Promise.all([
          fetch(`/api/tickets?page=1&limit=${DASHBOARD_TICKET_LIMIT}`), // For the table
          fetch(`/api/tickets/stats`) // For the stat cards
        ]);

        // Handle tickets response for the table
        if (!ticketsResponse.ok) {
          const errData = await ticketsResponse.json();
          throw new Error(errData.message || "Failed to fetch tickets for table");
        }
        const ticketsData = await ticketsResponse.json();
        setDashboardTickets(ticketsData.tickets || []);
        
        // Handle stats response for the cards
        if (!statsResponse.ok) {
            const errData = await statsResponse.json();
            throw new Error(errData.message || "Failed to fetch ticket stats");
        }
        const statsResult = await statsResponse.json();
        setStatsData(statsResult);

      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  if (isLoading) return <p className="p-4 text-center">Loading Dashboard...</p>;
  if (error) return <p className="p-4 text-center text-red-500">Error: {error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      {/* Stat cards now use the dedicated statsData state */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total" value={statsData?.total ?? 0} />
        <StatCard title="Today's" value={statsData?.today ?? 0} />
        {/* Your stats API returns 'open', not 'New', so we use that. */}
        <StatCard title="Open" value={statsData?.open ?? 0} />
        <StatCard title="Resolved" value={statsData?.resolved ?? 0} />
        <StatCard title="Closed" value={statsData?.closed ?? 0} />
      </div>

      {/* The table still uses the limited list of tickets */}
      <TicketsDataTable columns={columns} data={dashboardTickets} />

      {/* The link to all tickets now uses the total from the stats data */}
      {statsData && statsData.total > DASHBOARD_TICKET_LIMIT && (
        <div className="text-center mt-6">
          <Button asChild variant="link">
            <Link href="/dashboard/allTickets">
              View All {statsData.total} Tickets &rarr;
            </Link>
          </Button>
        </div>
      )}
       {statsData && statsData.total === 0 && !isLoading && (
         <p className="text-center mt-6 text-gray-500">No tickets yet.</p>
       )}
    </div>
  );
}
