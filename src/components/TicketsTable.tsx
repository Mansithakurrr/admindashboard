import React from "react";
import TicketSubject from "./TicketSubject";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

interface Ticket {
  sno: number;
  serialNumber: string;
  subject: {
    title: string;
    description: string;
  };
  // subject: string;
  name: string;
  // description: string;
  platformName: string;
  Organization: string;
  status: "New" | "Open" | "Hold" | "InProgress" | "Resolved" | "Closed";
  category: "bugs" | "Tech support" | "new feature" | "others";
  priority: "low" | "medium" | "high";
  type: "Support" | "Complaint" | "Feedback";

  days: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "serialNumber",
    header: "S.No",
    accessorFn: (row) => row.serialNumber,
  },
  {
    accessorKey: "subject",
    header: "Subject",
    accessorFn: (row) => row.subject,
    cell: ({ row }) => (
      <TicketSubject
        title={row.original.subject.title}
        description={row.original.subject.description}
      />
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    accessorFn: (row) => row.name,
  },
  {
    accessorKey: "Organization",
    header: "Organization",
    accessorFn: (row) => row.Organization,
  },
  {
    accessorKey: "platformName",
    header: "Platform",
    accessorFn: (row) => row.platformName,
  },
  {
    accessorKey: "status",
    header: "Status",
    accessorFn: (row) => row.status,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "type",
    header: "Type",
    accessorFn: (row) => row.type,
  },
  {
    accessorKey: "days",
    header: "Days",
    accessorFn: (row) => row.days,
  },
];

interface TicketsTableProps {
  tickets: Ticket[];
}

// 1. DEFINE THE ROW COLOR MAPPING
// We'll use very light shades (the '50' variant in Tailwind) for the row background
const rowColorClasses = {
  New: "bg-white",
  Open: "bg-orange-100",
  InProgress: "bg-purple-100",
  Hold: "bg-red-100",
  Resolved: "bg-green-100",
  Closed: "bg-gray-300",
};

const StatusBadge = ({ status }: { status: Ticket["status"] }) => {
  const statusClasses = {
    New: "white",
    Open: "bg-orange-100 text-orange-800",
    InProgress: "bg-purple-100 text-purple-800",
    Hold: "bg-red-100 text-red-800",
    Resolved: "bg-green-100 text-green-800",
    Closed: "bg-gray-300 text-black",
  };
  return (
    <span
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
};

const TicketsTable: React.FC<TicketsTableProps> = ({ tickets }) => {
  const table = useReactTable({
    data: tickets,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div className="mt-8 bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Recent Tickets</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tickets.map((ticket) => (
              // 2. APPLY THE DYNAMIC CLASS TO THE TABLE ROW
              <tr key={ticket.serialNumber} className={rowColorClasses[ticket.status]}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.serialNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {/* <TicketSubject
                    title={ticket.subject.title}
                    description={ticket.subject.description}
                  /> */}
                  <TicketSubject
                    title={ticket .subject.title}           // was ticket.subject.title
                    description={ticket.subject.description} // was ticket.subject.description
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.Organization}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.platformName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {ticket.days}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketsTable;
