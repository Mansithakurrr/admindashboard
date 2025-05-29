// src/components/Dashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import StatCard from "./StatCard";
import { columns } from "../app/dashboard/columns";
import { TicketsDataTable } from "./TicketsDataTable";
import { Ticket } from "../types/ticket";

type Stat = {
  title: string;
  value: number;
};

const Dashboard = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const res = await fetch(`${baseUrl}/api/tickets/stats`);
        const data = await res.json();

        if (data && typeof data === "object") {
          const formattedStats = [
            { title: "Total", value: data.total },
            { title: "Open", value: data.open },
            { title: "Resolved", value: data.resolved },
            { title: "Closed", value: data.closed },
          ];
          setStats(formattedStats);
        } else {
          throw new Error("Invalid stats data format");
        }
      } catch (err: any) {
        console.error("Error fetching stats:", err);
        setError("Failed to load stats.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
  // Fetch Tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const res = await fetch(`${baseUrl}/api/tickets`);
        const data = await res.json();

        console.log("Tickets API Response:", data);

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch tickets");
        }

        if (Array.isArray(data)) {
          setTickets(data);
        } else if (Array.isArray(data?.tickets)) {
          setTickets(data.tickets);
        } else {
          console.error("Invalid tickets data format received:", data);
          throw new Error("Invalid tickets data format");
        }
      } catch (err: any) {
        console.error("Error fetching tickets:", err);
        setError("Failed to load tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);


  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {stats.map((stat) => (
    <StatCard key={stat.title} title={stat.title} value={stat.value} />
  ))}
</div>

      <TicketsDataTable columns={columns} data={tickets} />
    </div>
  );
};

export default Dashboard;