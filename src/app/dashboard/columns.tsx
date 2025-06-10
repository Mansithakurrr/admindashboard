"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox"; // Checkbox import no longer needed here
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TicketSubject from "@/components/TicketSubject";
import { Ticket } from "@/types/ticket"; // Your Ticket type

// Re-defining the Ticket type here for clarity within this file

// export type Ticket = {
//   _id: string; // MongoDB document ID
//   name: string;
//   platformName: string;
//   Organization: string;
//   subject: {
//     title: string;
//     description: string;
//   };
//   status: "New" | "Open" | "Hold" | "InProgress" | "Resolved" | "Closed";
//   category: "bugs" | "Tech support" | "new feature" | "others";
//   priority: "low" | "medium" | "high";
//   type: "Support" | "Complaint" | "Feedback";
//   days: number;
//   createdAt: string; // use string when working with JSON dates
//   updatedAt: string;
// };
// Re-defining the StatusBadge component here for local use
export const StatusBadge = ({ status }: { status: Ticket["status"] }) => {
  const statusClasses = {
    New: "bg-blue-100 text-blue-800",
    Open: "bg-orange-100 text-orange-800",
    InProgress: "bg-purple-100 text-purple-800",
    Hold: "bg-red-100 text-red-800",
    Resolved: "bg-green-100 text-green-800",
    Closed: "bg-gray-300 text-black", // Matched your existing color
  };

  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);
  return (
    <span
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}
    >
      {capitalize(status)}
    </span>
  );
};

export const CategoryBadge = ({
  category,
}: {
  category: Ticket["category"];
}) => {
  const classes = {
    bugs: "bg-red-100 text-red-800",
    "Tech support": "bg-blue-100 text-blue-800",
    "new feature": "bg-purple-100 text-purple-800",
    others: "bg-gray-200 text-gray-800",
  };
  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${classes[category]}`}
    >
      {capitalize(category)}
    </span>
  );
};

export const PriorityBadge = ({
  priority,
}: {
  priority: Ticket["priority"];
}) => {
  const classes = {
    low: "bg-green-200 text-green-800",
    medium: "bg-yellow-200 text-yellow-800",
    high: "bg-orange-200 text-orange-800",
    // urgent: "bg-red-100 text-red-800", // Assuming 'urgent' is part of your Priority type if used
  };
  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);
  // @ts-ignore
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${classes[priority]}`}
    >
      {capitalize(priority)}
    </span>
  );
};

// 1. DEFINE STATUS OPTIONS FOR THE INLINE FILTER DROPDOWN
const STATUS_COLUMN_FILTER_OPTIONS: (Ticket["status"] | "All Statuses")[] = [
  "All Statuses",
  "New",
  "Open",
  "Hold",
  "InProgress",
  "Resolved",
  "Closed",
];

const PLATFORM_COLUMN_FILTER_OPTIONS: (string | "All Platforms")[] = [
  "All Platforms",
  "Light House",
  "Learn Tank",
  "Home Certify",
];

const PRIORITY_COLUMN_FILTER_OPTIONS: (Ticket["priority"] | "All Priorities")[] = [
  "All Priorities",
  "low",
  "medium",
  "high",
];

export const columns: ColumnDef<Ticket>[] = [
  // 1. NEW Serial Number Column (replaces checkbox column)
  {
    accessorKey: "serialNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span className="w-full text-center">S.No.</span>
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const serialNumber = row.getValue("serialNumber") as string;
      return <div className="font-medium text-center w-20">{serialNumber}</div>;
    },
    // enableHiding: false, // Optional: if you don't want users to hide this column
  },

  // 2. Subject Column
  {
    accessorKey: "subject.title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span className="w-full text-center">Subject</span>
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const subject = row.original.subject;
      const capitalize = (text: string) =>
        text.charAt(0).toUpperCase() + text.slice(1);

      return (

        <TicketSubject
          title={capitalize(subject.title)}
          description={capitalize(subject.description)}
        />

      );
    },
  },

  // Name Column
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >

        Name
        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
      </Button>
    ),
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      const capitalize = (text: string) =>
        text.charAt(0).toUpperCase() + text.slice(1);
      return <div className="font-medium text-center">{capitalize(name)}</div>;
    },
  },

  // Category Column
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span className="w-full text-center">Category</span>
        {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
      </Button>
    ),
    cell: ({ row }) => {
      const category = row.getValue("category") as Ticket["category"];
      return (
        <div className="flex justify-center items-center">
          <CategoryBadge category={category} />
        </div>
      );
    },
  },

  // Organization Column
  {
    accessorKey: "Organization", // Matches your provided code
    header: "Organization",
    cell: ({ row }) => {
      const organization = row.getValue("Organization") as string;
      return <div className="font-medium text-center">{organization}</div>;
    },
  },

  // Platform Column
  {
    accessorKey: "platformName",
    header: ({ column }) => {
      const currentFilterValue = column.getFilterValue() as string | undefined;
      return (
        <div className="flex items-center">
          <span className="w-full text-center">Platform</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-7 w-7 data-[state=open]:bg-accent"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${currentFilterValue && currentFilterValue !== "All Platforms"
                    ? "text-primary rotate-180"
                    : "text-muted-foreground/70"
                    }`}
                />
                <span className="sr-only">Filter by Platform</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by platform</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PLATFORM_COLUMN_FILTER_OPTIONS.map((platformOption) => (
                <DropdownMenuItem
                  key={platformOption}
                  onClick={() => {
                    if (platformOption === "All Platforms") {
                      column.setFilterValue(undefined); // Clear filter
                    } else {
                      column.setFilterValue(platformOption);
                    }
                  }}
                  className={
                    currentFilterValue === platformOption &&
                      platformOption !== "All Platforms"
                      ? "bg-accent font-semibold"
                      : ""
                  }
                >
                  {platformOption}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    cell: ({ row }) => row.getValue("platformName"),
  },
  // === MODIFIED STATUS COLUMN ===
  {
    accessorKey: "status",
    header: ({ column }) => {
      const currentFilterValue = column.getFilterValue() as string | undefined;
      return (
        <div className="flex items-center">
          {/* <div className="flex justify-center items-center">
            <StatusBadge status={"All Statuses"} />
          </div> */}
          <div className="text-xs font-semibold text-muted-foreground">Status</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-7 w-7 data-[state=open]:bg-accent"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${currentFilterValue && currentFilterValue !== "All Status"
                    ? "text-primary rotate-180"
                    : "text-muted-foreground/70"
                    }`}
                />
                <span className="sr-only">Filter by Status</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {STATUS_COLUMN_FILTER_OPTIONS.map((statusOption) => (
                <DropdownMenuItem
                  key={statusOption}
                  onClick={() => {
                    if (statusOption === "All Statuses") {
                      column.setFilterValue(undefined); // Clear filter
                    } else {
                      column.setFilterValue(statusOption);
                    }
                  }}
                  // Optionally, highlight the active filter
                  className={
                    currentFilterValue === statusOption &&
                      statusOption !== "All Statuses"
                      ? "bg-accent font-semibold"
                      : ""
                  }
                >
                  {statusOption}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },

  // === PRIORITY COLUMN ===
  {
    accessorKey: "priority",
    header: ({ column }) => {
      const currentFilterValue = column.getFilterValue() as string | undefined;
      return (
        <div className="flex items-center">
          {/* <span className="w-full text-center">Priority</span> */}
          <div className="text-xs w-full text-center font-semibold text-muted-foreground">Priority</div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-7 w-7 data-[state=open]:bg-accent"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${currentFilterValue && currentFilterValue !== "All Priorities"
                    ? "text-primary rotate-180"
                    : "text-muted-foreground/70"
                    }`}
                />
                <span className="sr-only">Filter by Priority</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by priority</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {PRIORITY_COLUMN_FILTER_OPTIONS.map((priorityOption) => (
                <DropdownMenuItem
                  key={priorityOption}
                  onClick={() => {
                    if (priorityOption === "All Priorities") {
                      column.setFilterValue(undefined); // Clear filter
                    } else {
                      column.setFilterValue(priorityOption);
                    }
                  }}
                  className={
                    currentFilterValue === priorityOption &&
                      priorityOption !== "All Priorities"
                      ? "bg-accent font-semibold"
                      : ""
                  }
                >
                  {priorityOption}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    cell: ({ row }) => <PriorityBadge priority={row.getValue("priority")} />,
  },

  // === MODIFIED DAYS COLUMN (Now represents Age) ===
  {
    id: "age", // 1. Provide a unique ID for this column
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Days
        <ArrowUpDown />
      </Button>
    ),
    // 2. Accessor function to return the calculated age in days for sorting
    accessorFn: (row) => {
      const createdAtString = row.createdAt;
      if (!createdAtString) return null; // So undefined/null values don't break sorting

      const createdAtDate = new Date(createdAtString);
      const today = new Date();
      const diffTime = today.getTime() - createdAtDate.getTime();
      let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 0) diffDays = 0;
      return diffDays; // Return the numerical age for sorting
    },
    // 3. Cell renderer remains the same, using original.createdAt for display logic
    cell: ({ row }) => {
      const createdAtString = row.original.createdAt; // Use original for cell display
      if (!createdAtString) {
        return <div className="text-center">N/A</div>;
      }

      const createdAtDate = new Date(createdAtString);
      const today = new Date();
      const diffTime = today.getTime() - createdAtDate.getTime();
      let diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) diffDays = 0;

      return (
        <div className="text-center">
          {diffDays} day{diffDays === 1 ? "" : "s"}
        </div>
      );
    },
  },

  // Date Created Column
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span className="w-full text-center">Date Created</span>
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const dateString = row.getValue("createdAt") as string;
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return (
        <span>
          {date.toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </span>
      );
    },
  },
];
