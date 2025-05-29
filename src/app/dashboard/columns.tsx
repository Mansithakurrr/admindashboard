// src/app/dashboard/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TicketSubject from "@/components/TicketSubject"; 
import { Ticket } from "@/types/ticket";
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
    Closed: "bg-gray-200 text-black",
  };
  return (
    <span
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
};

export const CategoryBadge = ({ category }: { category: Ticket["category"] }) => {
  const classes = {
    bugs: "bg-red-100 text-red-800",
    "Tech support": "bg-blue-100 text-blue-800",
    "new feature": "bg-purple-100 text-purple-800",
    others: "bg-gray-200 text-gray-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${classes[category]}`}
    >
      {category}
    </span>
  );
};

export const PriorityBadge = ({ priority }: { priority: Ticket["priority"] }) => {
  const classes = {
    low: "bg-gray-100 text-gray-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${classes[priority]}`}
    >
      {priority}
    </span>
  );
};

const type = {
  Support: "bg-blue-100 text-blue-800",
  Complaint: "bg-orange-100 text-orange-800",
  Feedback: "bg-green-100 text-green-800",
};

export const columns: ColumnDef<Ticket>[] = [
  // 1. Select Checkbox Column
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: any) =>
          table.toggleAllPageRowsSelected(!!value)
        }
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: any) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // 2. Subject Column
  {
    accessorKey: "subject.title", // Point directly to the title for sorting
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Subject
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      // We still use row.original to get the full subject object for rendering
      const subject = row.original.subject;
      return (
        <TicketSubject
          title={subject.title}
          description={subject.description}
        />
      );
    },
  },

  // 3. Name Column (with Sorting)
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {

    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <CategoryBadge category={row.getValue("category")} />,
  },
  {
    accessorKey: "Organization",
    header: "Organization",
    cell: ({ row }) => {
      const Organization = row.original.Organization;
      return <span>{Organization}</span>;
    },
  },
   // Date Created Column
   {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Date Created <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const dateString = row.getValue("createdAt") as string;
      if (!dateString) return 'N/A';
      const date = new Date(dateString); // Convert string to Date object
      return <span>{date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>;
    },
  },
  {
    accessorKey: "platformName",
    header: "Platform",
    cell: ({ row }) => {
      const platformName = row.original.platformName;
      return <span>{platformName}</span>;
    },
  },

  // 4. Status Column
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },

  // 5. Days Column (with Sorting)
  {
    accessorKey: "days",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Days
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("days")}</div>
    ),
  },

  // 6. Actions Column
  {
    id: "actions",
    cell: ({ row }) => {
      const ticket = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(ticket.subject.title)
              }
            >
              Copy ticket title
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View ticket details</DropdownMenuItem>
            <DropdownMenuItem>View user profile</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
