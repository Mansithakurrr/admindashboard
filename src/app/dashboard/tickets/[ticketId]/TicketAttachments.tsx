// src/app/dashboard/tickets/[ticketId]/TicketAttachments.tsx
import React from "react";
import { Ticket } from "@/types/ticketTypes";

interface TicketAttachmentsProps {
  attachments: Ticket["attachments"]; 
}

export const TicketAttachments: React.FC<TicketAttachmentsProps> = ({
  attachments,
}) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div>
      <h3 className="text-lg font-semibold border-b pb-2 mb-4">Attachments</h3>
      <div className="space-y-3">
        {attachments.map((attachment) => {
          return (
            <div key={attachment._id} className="flex items-center space-x-2">
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
                className="lucide lucide-file text-gray-500 flex-shrink-0"
              >
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              </svg>
              <div className="flex flex-col min-w-0">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm hover:underline truncate max-w-[180px]"
                >
                  {attachment.originalName}
                </a>
                <a
                  href={attachment.url}
                  download
                  className="text-xs text-gray-600 hover:text-black"
                >
                  Download
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};