export type Ticket = {
  sno: number;
    _id: string; // MongoDB document ID
    name: string;
    platformName: string;
    Organization: string;
    subject: {
      title: string;
      description: string;
    };
    status: "New" | "Open" | "Hold" | "InProgress" | "Resolved" | "Closed";
    category: "bugs" | "Tech support" | "new feature" | "others";
    priority: "low" | "medium" | "high";
    type: "Support" | "Complaint" | "Feedback";
    days: number;
    createdAt: string; // use string when working with JSON dates
    updatedAt: string;
  };