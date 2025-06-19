// src/types/ticket.ts
export type Priority = "low" | "medium" | "high";

// Define the structure for an activity log entry
export type ActivityLogEntry = {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  from?: string;
  to?: string;
  details?: string;
};
export interface Attachment {
  _id: string;
  originalName: string;
  url: string;
}

export type Ticket = {
  resolvedRemarks: string;
  _id: string;
  serialNumber: string;
  subject: {
    title: string;
    description: string;
  };
  name: string;
  email: string;
  contactNumber: string;
  platformId: string;
  orgId: string;
  platformName?: string;
  organizationName?: string;
  status: "New" | "Open" | "Hold" | "InProgress" | "Resolved" | "Closed";
  category: "bugs" | "Tech support" | "new feature" | "others";
  priority: Priority;
  type: "Support" | "Complaint" | "Feedback";
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  activityLog: ActivityLogEntry[];
  comments?: Comment[];
  __v?: number;
};

// Assuming you have a Comment type
export type Comment = {
  createdAt: string | number | Date;
  _id: string;
  text: string;
  author: string;
  timestamp: string;
  formattedTimestamp?: string;
};

export interface TicketStats {

  total: number;

  open: number;

  resolved: number;

  closed: number;

}