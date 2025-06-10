// src/app/dashboard/tickets/[ticketId]/page.tsx

// OPTION 1: SERVER COMPONENT (Recommended for data fetching)
import Link from "next/link";
import { CommentSection } from "@/components/CommentSection";
import { EditableField } from "@/components/EditableField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Ticket, Priority } from "@/types/ticket"; // Import Ticket type
// Assume you have a fetchTicketById function in lib/api.ts or similar
// This function would fetch from `${process.env.NEXT_PUBLIC_APP_URL}/api/tickets/${id}`
import { fetchTicketById } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "../../columns";
import { CategoryBadge } from "../../columns";
import { PriorityBadge } from "../../columns";
import TicketViewClient from "./TicketViewClient";

const STATUS_OPTIONS: Ticket["status"][] = [
  "New",
  "Open",
  "InProgress",
  "Hold",
  "Resolved",
  "Closed",
];
const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high"];
const CATEGORY_OPTIONS: Ticket["category"][] = [
  "bugs",
  "Tech support",
  "new feature",
  "others",
];

interface TicketInfoPageProps {
  params: {
    ticketId: string; // This will be the _id string
  };
}
export default async function TicketInfoPage({ params }: TicketInfoPageProps) {
  const ticketData = await fetchTicketById(params?.ticketId);

  if (!ticketData) {
    return (
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold">Ticket Not Found</h1>
        <p>The ticket with ID {params?.ticketId} could not be found.</p>
        <Link
          href="/dashboard"
          className="text-blue-500 hover:underline mt-4 inline-block"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const initialTicketWithLog: Ticket = {
    ...ticketData,
    // Ensure activityLog is an array. If API might not return it, provide default
    activityLog: ticketData.activityLog || [
      {
        id: Date.now().toString(),
        timestamp: ticketData.createdAt, // Use actual ticket creation time
        user: "System",
        action: "Ticket Created",
      },
    ],
  };

  return (
    // Main page container: A full-height flex column
    <div className="flex flex-col h-screen overflow-hidden">
      {/* 1. Header Container: Fixed height, with its OWN internal grid layout */}
      <div className="grid grid-cols-3 items-center flex-shrink-0">
        {/* Left Slot */}
        <div className="justify-self-start">
          <Link
            href="/dashboard"
            className="text-blue-500 hover:underline text-sm flex items-center gap-2 px-6"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            {/* <span>Dashboard</span> */}
          </Link>
        </div>

        {/* Center Slot */}
        <h2 className="text-xl font-semibold text-center">
          Ticket #{ticketData.serialNumber || ticketData._id}
        </h2>

        {/* Right Slot (empty for spacing to keep the title centered) */}
        <div></div>
      </div>

      {/* 2. Main Content Area: Takes up all remaining space and handles its own scrolling */}
      <div className="flex-1">
        <TicketViewClient initialTicket={initialTicketWithLog} />
      </div>
    </div>
  );
}
// {/* <div className="grid grid-cols-3 items-center p-4 border-b bg-white flex-shrink-0">

//   {/* Left Slot: Justifies itself to the start of the first column */}
//   <div className="justify-self-start">
//     <Link href="/dashboard" className="text-blue-500 hover:underline text-sm flex items-center gap-2">
//       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
//       <span>Back</span>
//     </Link>
//   </div>

//   {/* Center Slot: Is centered in the middle column */}
//   <h2 className="text-xl font-semibold text-center">
//     Ticket #{ticketData.serialNumber ?? "N/A"}
//   </h2>

//   {/* Right Slot: Empty, but necessary to keep the center column perfectly centered */}
//   <div></div>

// </div> */}