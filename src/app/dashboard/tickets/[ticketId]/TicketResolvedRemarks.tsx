// src/app/dashboard/tickets/[ticketId]/TicketResolvedRemarks.tsx
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Ticket } from "@/types/ticketTypes"; // Import Ticket type

interface TicketResolvedRemarksProps {
  ticketStatus: Ticket["status"];
  resolvedRemarks: string | undefined;
  remarksText: string;
  setRemarksText: (text: string) => void;
  isEditingRemarks: boolean;
  handleSaveRemarks: () => void;
  handleCancelEditRemarks: () => void;
  isSaving: boolean;
}

export const TicketResolvedRemarks: React.FC<TicketResolvedRemarksProps> = ({
  ticketStatus,
  resolvedRemarks,
  remarksText,
  setRemarksText,
  isEditingRemarks,
  handleSaveRemarks,
  handleCancelEditRemarks,
  isSaving,
}) => {
  return (
    <div>
      {ticketStatus === "Resolved" && !resolvedRemarks && (
        <div className="mt-6 pt-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold text-gray-700">
              Resolved Remarks <span className="text-red-500">*</span>
            </h2>
          </div>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter remarks"
              value={remarksText || ""}
              onChange={(e) => setRemarksText(e.target.value)}
              rows={5}
              className="w-full border-primary"
              disabled={isSaving}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="ghost"
                onClick={handleCancelEditRemarks}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveRemarks}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isSaving ? "Saving..." : "Save Remarks"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {resolvedRemarks && (
        <div>
          <label className="text-xs font-semibold text-gray-500">
            Resolution Remarks
          </label>
          <p className="mt-1 text-sm text-gray-700 bg-gray-100 p-3 rounded-md border break-words">
            {resolvedRemarks}
          </p>
        </div>
      )}
    </div>
  );
};