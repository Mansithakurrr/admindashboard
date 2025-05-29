// src/types/ticket.ts
export type Priority = "low" | "medium" | "high"; // Matches your API's lowercase

export type Ticket = {
  _id: string; // THIS IS YOUR PRIMARY ID FROM THE API
  sno?: number; // Remove 'sno' if your API doesn't provide it.
  // If you add it later, make it optional.
  subject: {
    title: string;
    description: string;
  };
  name: string;
  platformName: string; // Matches your API
  Organization: string; // Matches your API (capital 'O')
  status: "New" | "Open" | "Hold" | "InProgress" | "Resolved" | "Closed"; // API returns "Resolved"
  category: "bugs" | "Tech support" | "new feature" | "others"; // API returns "others"
  priority: Priority; // API returns "high"
  type: "Support" | "Complaint" | "Feedback"; // API returns "Feedback"
  days: number;
  createdAt: string; // API returns ISO string
  updatedAt: string; // API returns ISO string
  __v?: number; // Optional, as it's a MongoDB internal
  activityLog?: ActivityLogEntry[]; // Keep if you're still planning this feature
};

export type TicketStats = {
  total: number;
  open: number;
  resolved: number;
  closed: number;
};

// Define ActivityLogEntry if you are using it
export type ActivityLogEntry = {
  id: string;
  timestamp: Date; // Or string if API returns string
  user: string;
  action: string;
  from?: string;
  to?: string;
  details?: string;
};
