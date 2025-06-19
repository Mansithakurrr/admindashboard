// src/app/dashboard/tickets/[ticketId]/TicketSidebar.tsx
import React from "react";
import { Ticket, Priority, Attachment } from "@/types/ticketTypes";
import { EditableField } from "@/components/EditableField"; // Assuming the updated EditableField
import { StatusBadge, CategoryBadge, PriorityBadge } from "../../columns";
import { TicketResolvedRemarks } from "./TicketResolvedRemarks";
import { TicketAttachments } from "./TicketAttachments";

// Ensure Option interface is available here if not imported from shared types
interface Option {
  label: string;
  value: string;
}

interface TicketSidebarProps {
  ticket: Ticket;
  availableStatusOptions: Ticket["status"][];
  onStatusChange: (newStatus: string) => void;
  onFieldUpdate: (
    fieldName:
      | keyof Ticket
      | `subject.${"title" | "description"}`
      | "platformData"
      | "organizationData",
    newValue: any,
    originalValue: any
  ) => Promise<void>;
  remarksText: string;
  setRemarksText: (text: string) => void;
  isEditingRemarks: boolean;
  handleSaveRemarks: () => void;
  handleCancelEditRemarks: () => void;
  isSaving: boolean;
  originalRemarks: string;
  organizationOptions: Option[]; // Still Option[]
  platformOptions: Option[];     // Still Option[]
  attachments?: Attachment[];
}

export const TicketSidebar: React.FC<TicketSidebarProps> = ({
  ticket,
  availableStatusOptions,
  onStatusChange,
  onFieldUpdate,
  remarksText,
  setRemarksText,
  isEditingRemarks,
  handleSaveRemarks,
  handleCancelEditRemarks,
  isSaving,
  originalRemarks,
  organizationOptions,
  platformOptions,
  attachments,
}) => {
  return (
    <aside className="w-80 flex-shrink-0 border-l bg-gray-50 p-6 space-y-6 overflow-y-auto h-full">
      <h3 className="text-lg font-semibold border-b pb-2">Ticket Details</h3>

      <TicketResolvedRemarks
        ticketStatus={ticket.status}
        resolvedRemarks={ticket.resolvedRemarks}
        remarksText={remarksText}
        setRemarksText={setRemarksText}
        isEditingRemarks={isEditingRemarks}
        handleSaveRemarks={handleSaveRemarks}
        handleCancelEditRemarks={handleCancelEditRemarks}
        isSaving={isSaving}
      />

      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <EditableField
          label="Status"
          value={ticket.status}
          options={availableStatusOptions} // These are strings, EditableField will normalize to {label: s, value: s}
          onValueChange={onStatusChange}
          renderValue={(value) => (
            <StatusBadge status={value as Ticket["status"]} />
          )}
        />
        <EditableField
          label="Priority"
          value={ticket.priority}
          options={["low", "medium", "high"]} // Strings, normalized by EditableField
          onValueChange={(newVal) =>
            onFieldUpdate("priority", newVal, ticket.priority)
          }
          renderValue={(value) => (
            <PriorityBadge priority={value as Priority} />
          )}
        />
        <EditableField
          label="Category"
          value={ticket.category}
          options={[
            "bugs",
            "Tech support",
            "new feature",
            "others",
          ]} // Strings, normalized by EditableField
          onValueChange={(newVal) =>
            onFieldUpdate("category", newVal, ticket.category)
          }
          renderValue={(value) => (
            <CategoryBadge category={value as Ticket["category"]} />
          )}
        />
        <EditableField
          label="Organization"
          value={ticket.organizationName || ""} // Display the name
          options={organizationOptions} // Pass the full Option objects
          onValueChange={(newValue: string) => { // newValue will be the 'value' (ID) from the selected option
            const selectedOption = organizationOptions.find((opt) => opt.value === newValue);
            if (!selectedOption) return; // Should not happen if options are valid
            onFieldUpdate(
              "organizationData",
              {
                orgId: selectedOption.value,
                organizationName: selectedOption.label,
              },
              {
                orgId: ticket.orgId,
                organizationName: ticket.organizationName,
              }
            );
          }}
        />
        <EditableField
          label="Platform"
          value={ticket.platformName || ""} // Display the name
          options={platformOptions} // Pass the full Option objects
          onValueChange={(newValue: string) => { // newValue will be the 'value' (ID) from the selected option
            const selectedOption = platformOptions.find((opt) => opt.value === newValue);
            if (!selectedOption) return; // Should not happen if options are valid
            onFieldUpdate(
              "platformData",
              {
                platformId: selectedOption.value,
                platformName: selectedOption.label,
              },
              {
                platformId: ticket.platformId,
                platformName: ticket.platformName,
              }
            );
          }}
        />
      </div>

      {attachments && attachments.length > 0 && (
        <TicketAttachments attachments={attachments} />
      )}

      <div>
        <label className="text-xs font-semibold text-gray-500">
          Date Created
        </label>
        <p className="mt-1 text-sm">
          {new Date(ticket.createdAt).toLocaleString("en-IN", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </p>
      </div>
    </aside>
  );
};