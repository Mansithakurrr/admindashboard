// src/app/dashboard/tickets/[ticketId]/TicketActivityTab.tsx
import React from "react";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { ActivityLogEntry } from "@/types/ticketTypes";

interface TicketActivityTabProps {
  activities: ActivityLogEntry[];
}

export const TicketActivityTab: React.FC<TicketActivityTabProps> = ({
  activities,
}) => {
  return <ActivityTimeline activities={activities} />;
};