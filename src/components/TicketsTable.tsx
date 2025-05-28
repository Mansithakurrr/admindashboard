import React from "react";
import TicketSubject from "./TicketSubject";

interface Ticket {
  sno: number;
  serialNumber: string;
  // subject: {
  //   title: string;
  //   description: string;
  // };
  subject: string;
  name: string;
  description: string;
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
  return (
    <div className="mt-8 bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Recent Tickets</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Platform
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Days
              </th>
            </tr>
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
                    title={ticket.subject.title}           // was ticket.subject.title
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
