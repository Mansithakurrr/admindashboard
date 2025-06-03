// src/types/ticket.ts
export type Priority = "low" | "medium" | "high"; // Matches your API's lowercase

// Define the structure for an activity log entry
export type ActivityLogEntry = {
  id: string; // Or Date.now().toString() or a UUID
  timestamp: string; // Store as ISO string, format on display
  user: string; // Who performed the action
  action: string; // e.g., "Status changed", "Comment added"
  from?: string; // Optional: previous value
  to?: string;   // Optional: new value
  details?: string; // Optional: e.g., the comment text
};

export type Ticket = {
  _id: string;
  serialNumber?: string; // Now that you have a Mongoose model with it
  subject: {
    title: string;
    description: string;
  };
  name: string;
  platformName: string;
  Organization: string;
  status: "New" | "Open" | "Hold" | "InProgress" | "Resolved" | "Closed";
  category: "bugs" | "Tech support" | "new feature" | "others";
  priority: Priority;
  type: "Support" | "Complaint" | "Feedback";
  // days: number;
  createdAt: string; // API returns ISO string
  updatedAt: string; // API returns ISO string
  activityLog: ActivityLogEntry[]; // Array to hold the ticket's history
  comments?: Comment[]; // Optional: if comments are part of the ticket document
  __v?: number;
};

// Assuming you have a Comment type
export type Comment = {
  _id: string; // Or however your comment IDs are structured
  text: string;
  author: string;
  timestamp: string; // Store as ISO string
  formattedTimestamp?: string;
};

export interface TicketStats {

  total: number;

  open: number;

  resolved: number;

  closed: number;

}