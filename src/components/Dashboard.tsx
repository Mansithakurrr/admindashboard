// src/components/Dashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import StatCard from "./StatCard";
import { columns, Ticket } from "../app/dashboard/columns"; // Import columns and type
import { TicketsDataTable } from "./TicketsDataTable";

type Stat = {
  title: string;
  value: number;
};

// --- MOCK DATA ---
const stats = [
  { title: "Total", value: 1250 },
  { title: "New", value: 88 },
  { title: "Resolved", value: 972 },
  { title: "Closed", value: 190 },
];

const recentTickets: Ticket[] = [
  {
    sno: 1,
    subject: {
      title: "Cannot access the system",
      description:
        "Life seasons open have. Air have of. Lights fill after let third darkness replenish fruitful let.",
    },
    name: "John Doe",
    orgId: "ORG-001",
    platformId: "PLT-A",
    status: "New",
    days: 1,
    category: "Tech support",
  },
  {
    sno: 2,
    subject: {
      title: "Password reset link expired",
      description:
        "Wherein set image. Creepeth said above gathered bring. Subdue whose whose, saying.",
    },
    name: "Jane Smith",
    orgId: "ORG-002",
    platformId: "PLT-B",
    status: "Resolved",
    days: 2,
    category: "Tech support",
  },
  {
    sno: 3,
    subject: {
      title: "Unable to upload file",
      description:
        "You will not be able to see this full text because it is very long and designed to be truncated by the styling.",
    },
    name: "Peter Jones",
    orgId: "ORG-001",
    platformId: "PLT-A",
    status: "InProgress",
    days: 5,
    category: "bugs",
  },
  {
    sno: 4,
    subject: {
      title: "Subscription renewal failed",
      description:
        "The payment gateway returned an error during the monthly subscription renewal process for this user.",
    },
    name: "Mary Brown",
    orgId: "ORG-003",
    platformId: "PLT-C",
    status: "Hold",
    days: 10,
    category: "bugs",
  },
  {
    sno: 5,
    subject: {
      title: "Dashboard analytics not loading",
      description:
        "The main analytics chart on the dashboard is stuck in a loading state and does not display any data.",
    },
    name: "Alex Johnson",
    orgId: "ORG-002",
    platformId: "PLT-B",
    status: "Open",
    days: 3,
    category: "bugs",
  },
  {
    sno: 6,
    subject: {
      title: "Incorrect invoice generated",
      description:
        "The invoice for last month (April 2025) shows the wrong amount and incorrect line items.",
    },
    name: "John Doe",
    orgId: "ORG-001",
    platformId: "PLT-A",
    status: "Open",
    days: 4,
    category: "others",
  },
  {
    sno: 7,
    subject: {
      title: "Feature request: Dark Mode",
      description:
        "Requesting the implementation of a dark mode theme for the entire application for better usability at night.",
    },
    name: "Samantha Lee",
    orgId: "ORG-004",
    platformId: "PLT-D",
    status: "New",
    days: 1,
    category: "new feature",
  },
  {
    sno: 8,
    subject: {
      title: "User export function is slow",
      description:
        "When exporting more than 500 users to CSV, the process takes over 5 minutes and sometimes times out.",
    },
    name: "Peter Jones",
    orgId: "ORG-001",
    platformId: "PLT-A",
    status: "InProgress",
    days: 8,
    category: "bugs",
  },
  {
    sno: 9,
    subject: {
      title: "Login issues on mobile app (iOS)",
      description:
        "After the latest app update (v2.5.1), I am unable to log in using my credentials on my iPhone 15.",
    },
    name: "Emily Carter",
    orgId: "ORG-005",
    platformId: "PLT-E",
    status: "Hold",
    days: 6,
    category: "Tech support",
  },
  {
    sno: 10,
    subject: {
      title: "Typo on the pricing page",
      description:
        'There is a small spelling mistake in the description of the "Enterprise" plan on the public website.',
    },
    name: "David Wilson",
    orgId: "ORG-003",
    platformId: "PLT-C",
    status: "Resolved",
    days: 1,
    category: "others",
  },
  {
    sno: 11,
    subject: {
      title: "API key permissions not updating",
      description:
        "I updated the permissions for my API key to be read-only, but it still allows write operations.",
    },
    name: "Jane Smith",
    orgId: "ORG-002",
    platformId: "PLT-B",
    status: "Closed",
    days: 15,
    category: "bugs",
  },
];

const Dashboard = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} title={stat.title} value={stat.value} />
        ))}
      </div>
      <TicketsDataTable columns={columns} data={recentTickets} />
    </div>
  );
};

export default Dashboard;
