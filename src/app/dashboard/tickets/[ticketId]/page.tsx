// src/app/dashboard/tickets/[ticketId]/page.tsx

import Link from "next/link";
import { Ticket, Priority } from "@/types/ticketTypes";
import TicketViewClient from "./TicketViewClient";
import { getTicketById } from "@/services/ticketService";
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
    ticketId: string;
  };
}

// interface TicketInfoPageProps {
//   params: { ticketId: string } | Promise<{ ticketId: string }>;
// }

export default async function TicketInfoPage({ params }: any) {
  const { ticketId } = await params;

  const ticketData = await getTicketById(ticketId);

  if (!ticketData) {
    return (
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold">Ticket Not Found</h1>
        <p>The ticket with ID {ticketId} could not be found.</p>
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
    activityLog: ticketData.activityLog || [
      {
        id: Date.now().toString(),
        timestamp: ticketData.createdAt,
        user: "System",
        action: "Ticket Created",
      },
    ],
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="grid grid-cols-3 items-center flex-shrink-0">
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
          </Link>
        </div>

        <h2 className="text-xl font-semibold text-center">
          Ticket #{ticketData.serialNumber || ticketData._id}
        </h2>

        <div></div>
      </div>

      <div className="flex-1">
        <TicketViewClient initialTicket={initialTicketWithLog} />
      </div>
    </div>
  );
}