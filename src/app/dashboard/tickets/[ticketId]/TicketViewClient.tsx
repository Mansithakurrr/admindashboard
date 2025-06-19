// src/app/dashboard/tickets/[ticketId]/TicketViewClient.tsx
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Ticket, Priority, ActivityLogEntry } from "@/types/ticketTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import your sub-components
import { TicketTitleEditor } from "./TicketTitleEditor";
import { TicketDescriptionEditor } from "./TicketDescriptionEditor";
import { CommentSection } from "@/components/CommentSection";
import { TicketSidebar } from "./TicketSidebar";
import { TicketActivityTab } from "./TicketActivityTab";
import { TicketResolvedRemarks } from "./TicketResolvedRemarks";
import { TicketAttachments } from "./TicketAttachments";

// Define a type for your options - this can be shared across client and server components
interface Option {
  label: string;
  value: string; // This will be the actual MongoDB ObjectId string
}

interface ApiOrgPlatformData {
  _id: string;
  name: string;
}

interface TicketViewClientProps {
  initialTicket: Ticket;
}

const ALL_POSSIBLE_STATUSES: Ticket["status"][] = [
  "New",
  "Open",
  "InProgress",
  "Hold",
  "Resolved",
  "Closed",
];

const TicketViewClient: React.FC<TicketViewClientProps> = ({
  initialTicket,
}) => {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [activeTab, setActiveTab] = useState("details");

  // State for fetched dynamic options
  const [organizationOptions, setOrganizationOptions] = useState<Option[]>([]);
  const [platformOptions, setPlatformOptions] = useState<Option[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [errorLoadingOptions, setErrorLoadingOptions] = useState<string | null>(null);

  // State for editable fields (keep these at the parent level as they control global behavior)
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [originalTitle, setOriginalTitle] = useState(initialTicket.subject.title);
  const [showTitleHistory, setShowTitleHistory] = useState(false);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [originalDescription, setOriginalDescription] = useState(initialTicket.subject.description);
  const [showDescriptionHistory, setShowDescriptionHistory] = useState(false);

  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [originalRemarks, setOriginalRemarks] = useState(initialTicket.resolvedRemarks || "");
  const [remarksText, setRemarksText] = useState(initialTicket.resolvedRemarks || "");
  const [isSaving, setIsSaving] = useState(false); // For global saving state
  const [originalStatus, setOriginalStatus] = useState(initialTicket.status); // Stores the status *before* any optimistic change or "Resolved" selection


  // Effect to update internal state when initialTicket prop changes (e.g., after re-fetch)
  useEffect(() => {
    setTicket(initialTicket);
    setOriginalTitle(initialTicket.subject.title);
    setOriginalDescription(initialTicket.subject.description);
    setOriginalRemarks(initialTicket.resolvedRemarks || "");
    setRemarksText(initialTicket.resolvedRemarks || ""); // Ensure remarksText is updated
    setOriginalStatus(initialTicket.status); // Reset originalStatus
    setIsEditingRemarks(false); // Reset editing remarks state on initialTicket change
    setIsEditingTitle(false); // Reset title editing state
    setIsEditingDescription(false); // Reset description editing state
    setShowTitleHistory(false); // Reset history view
    setShowDescriptionHistory(false); // Reset history view
  }, [initialTicket]);

  // NEW EFFECT: Fetch Organization and Platform Options on component mount
  useEffect(() => {
    const fetchDynamicOptions = async () => {
      setIsLoadingOptions(true);
      setErrorLoadingOptions(null);
      try {
        const [orgsRes, platformsRes] = await Promise.all([
          fetch("/api/organizations"),
          fetch("/api/platforms"),
        ]);

        if (!orgsRes.ok) {
          throw new Error(`Failed to fetch organizations: ${orgsRes.statusText}`);
        }
        if (!platformsRes.ok) {
          throw new Error(`Failed to fetch platforms: ${platformsRes.statusText}`);
        }

        const orgsData: ApiOrgPlatformData[] = await orgsRes.json();
        const platformsData: ApiOrgPlatformData[] = await platformsRes.json();

        setOrganizationOptions(orgsData.map(org => ({ label: org.name, value: org._id })));
        setPlatformOptions(platformsData.map(plat => ({ label: plat.name, value: plat._id })));

      } catch (error: any) {
        console.error("Error fetching dynamic options:", error);
        setErrorLoadingOptions(error.message || "Failed to load organization/platform options.");
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchDynamicOptions();
  }, []);


  // Helper function to create an activity log entry
  const createActivityLogEntry = useCallback(
    (action: string, from?: string, to?: string, details?: string): ActivityLogEntry => {
      const detailString = details || (from && to ? `${action} from "${from}" to "${to}"` : action);
      return {
        id: Date.now().toString(), // Unique ID for the log entry
        timestamp: new Date().toISOString(),
        user: "System", // TODO: Replace with actual logged-in user name/ID
        action,
        details: detailString,
      };
    },
    []
  );

  // Function to persist changes to the backend API
  // Modified to accept an array of activity logs
  const persistTicketUpdate = useCallback(
    async (updates: Partial<Ticket>, activityEntries?: ActivityLogEntry[]) => {
      try {
        setIsSaving(true); // Indicate saving in progress

        // Construct the payload for the PATCH request
        const payload: any = { ...updates };
        if (activityEntries && activityEntries.length > 0) {
          // Using $each to push multiple activity log entries
          payload.$push = { activityLog: { $each: activityEntries } };
        }

        const res = await fetch(`/api/tickets/${ticket._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update ticket");
        }

        const updatedTicket = await res.json();
        setTicket((prevTicket) => ({
          ...prevTicket!, // Take all existing fields from the previous ticket state
          ...updatedTicket, // Apply the fields from the backend's response (which should be the full ticket)
        }));
      } catch (error: any) {
        console.error("Error updating ticket:", error);
        // TODO: Implement user-facing error message here (e.g., using a toast notification)
        // Consider reverting optimistic UI update on failure
      } finally {
        setIsSaving(false); // Reset saving state
      }
    },
    [ticket._id] // Depend on ticket._id to ensure correct endpoint
  );

  // Generic handler for field updates (priority, category, organization, platform)
  const handleFieldUpdate = useCallback(
    async (
      fieldName:
        | keyof Ticket
        | `subject.${"title" | "description"}`
        | "platformData"
        | "organizationData", // Custom field names for handling nested/combined updates
      newValue: any,
      originalValue: any // Original value before optimistic update
    ) => {
      let activityEntry: ActivityLogEntry | undefined;
      let updatesToPersist: Partial<Ticket> = {};
      let optimisticTicketUpdate: Partial<Ticket> = {}; // For immediate UI update

      // Helper for creating human-readable field labels
      const getFieldLabel = (field: string) => {
        switch (field) {
          case "orgId":
          case "organizationData":
            return "Organization";
          case "platformId":
          case "platformData":
            return "Platform";
          case "priority":
            return "Priority";
          case "status":
            return "Status";
          case "category":
            return "Category";
          default:
            return field.charAt(0).toUpperCase() + field.slice(1);
        }
      };

      if (typeof fieldName === "string" && fieldName.startsWith("subject.")) {
        // Handle nested subject fields (title, description)
        const subField = fieldName.split(".")[1] as "title" | "description";
        activityEntry = createActivityLogEntry(
          `${getFieldLabel(subField)} Updated`,
          originalValue,
          newValue
        );
        updatesToPersist = {
          subject: { ...ticket.subject, [subField]: newValue },
        };
        optimisticTicketUpdate = {
          subject: { ...ticket.subject, [subField]: newValue },
        };
      } else if (fieldName === "platformData") {
        // Handle platform data update (combines platformId and platformName)
        const { platformId, platformName } = newValue;
        activityEntry = createActivityLogEntry(
          "Platform Changed",
          originalValue.platformName,
          platformName
        );
        updatesToPersist = { platformId, platformName };
        optimisticTicketUpdate = { platformId, platformName };
      } else if (fieldName === "organizationData") {
        // Handle organization data update
        const { orgId, organizationName } = newValue;
        activityEntry = createActivityLogEntry(
          "Organization Changed",
          originalValue.organizationName,
          organizationName
        );
        updatesToPersist = { orgId, organizationName };
        optimisticTicketUpdate = { orgId, organizationName };
      } else {
        activityEntry = createActivityLogEntry(
          `${getFieldLabel(fieldName)} Changed`,
          originalValue,
          newValue
        );
        updatesToPersist = { [fieldName]: newValue };
        optimisticTicketUpdate = { [fieldName]: newValue };
      }

      // Optimistically update UI
      setTicket((prev) => ({
        ...prev!,
        ...optimisticTicketUpdate,
      }));

      // Persist changes to backend
      await persistTicketUpdate(updatesToPersist, activityEntry ? [activityEntry] : undefined);
    },
    [ticket, createActivityLogEntry, persistTicketUpdate] // Dependencies for useCallback
  );

  // Handlers for Title editing
  const handleSaveTitle = useCallback(() => {
    if (ticket.subject.title !== originalTitle) {
      handleFieldUpdate("subject.title", ticket.subject.title, originalTitle);
      setOriginalTitle(ticket.subject.title); // Update original after successful save/sync
    }
    setIsEditingTitle(false);
  }, [ticket.subject.title, originalTitle, handleFieldUpdate]);

  const handleCancelEditTitle = useCallback(() => {
    setTicket((prev) => ({
      ...prev!,
      subject: { ...prev!.subject, title: originalTitle },
    }));
    setIsEditingTitle(false);
  }, [originalTitle]);

  // Handlers for Description editing
  const handleSaveDescription = useCallback(() => {
    if (ticket.subject.description !== originalDescription) {
      handleFieldUpdate("subject.description", ticket.subject.description, originalDescription);
      setOriginalDescription(ticket.subject.description); // Update original after successful save/sync
    }
    setIsEditingDescription(false);
  }, [ticket.subject.description, originalDescription, handleFieldUpdate]);

  const handleCancelEditDescription = useCallback(() => {
    setTicket((prev) => ({
      ...prev!,
      subject: { ...prev!.subject, description: originalDescription },
    }));
    setIsEditingDescription(false);
  }, [originalDescription]);

  // Handlers for Resolution Remarks
  const handleSaveRemarks = useCallback(async () => {
    if (!remarksText || remarksText.trim() === "") {
      alert("Resolution remarks are required to mark this ticket as Resolved.");
      return;
    }

    try {
      setIsSaving(true);
      const updatesToPersist: Partial<Ticket> = { resolvedRemarks: remarksText };
      const activityLogsToPersist: ActivityLogEntry[] = [];

      activityLogsToPersist.push(createActivityLogEntry(
        "Resolved Remarks Updated",
        originalRemarks,
        remarksText,
        "User added/updated resolution remarks."
      ));

      if (originalStatus !== "Resolved") {
        updatesToPersist.status = "Resolved";
        activityLogsToPersist.push(createActivityLogEntry(
          "Status Changed",
          originalStatus,
          "Resolved"
        ));
      }

      await persistTicketUpdate(updatesToPersist, activityLogsToPersist);

      setOriginalRemarks(remarksText);
      setOriginalStatus("Resolved");

      setIsEditingRemarks(false);
    } catch (error: any) {
      console.error("Error saving remarks:", error.message);
      alert(`Error saving remarks: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [
    remarksText,
    originalRemarks,
    originalStatus, // Dependency for knowing if status needs to be persisted
    createActivityLogEntry,
    persistTicketUpdate,
  ]);

  const handleCancelEditRemarks = useCallback(() => {
    setRemarksText(originalRemarks);
    if (ticket.status !== originalStatus) {
      setTicket((prev) => ({ ...prev!, status: originalStatus }));
    }
    setIsEditingRemarks(false);
  }, [originalRemarks, originalStatus, ticket.status]);


  // Handler for adding new comments
  const handleCommentAdded = useCallback(
    async (commentText: string, author: string) => {
      const newEntry: ActivityLogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        user: author,
        action: "Comment Added",
        details: commentText,
      };

      try {
        const res = await fetch(`/api/tickets/${ticket._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            $push: { activityLog: newEntry },
          }),
        });

        if (!res.ok) throw new Error("Failed to add comment");

        const updatedTicket = await res.json();
        setTicket((prev) => ({
          ...prev!,
          activityLog: updatedTicket.activityLog,
        }));
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    },
    [ticket._id]
  );

  // Logic to determine allowed status transitions
  const getAllowedNextStatuses = useCallback(
    (currentStatus: Ticket["status"]): Ticket["status"][] => {
      const availableOptions = new Set<Ticket["status"]>();
      availableOptions.add(currentStatus); // Always allow current status

      switch (currentStatus) {
        case "New":
          availableOptions.add("Open");
          break;
        case "Open":
          availableOptions.add("InProgress");
          availableOptions.add("Hold");
          availableOptions.add("Resolved");
          availableOptions.add("Closed");
          break;
        case "InProgress":
          availableOptions.add("Hold");
          availableOptions.add("Resolved");
          availableOptions.add("Closed");
          break;
        case "Hold":
          availableOptions.add("InProgress");
          availableOptions.add("Resolved");
          availableOptions.add("Closed");
          break;
        case "Resolved":
          availableOptions.add("Closed");
          // If status is already Resolved, don't re-open remarks editor on selection
          break;
        case "Closed":
          // No transitions from Closed usually
          break;
        default:
          // Fallback for unknown status, allow all possible statuses
          ALL_POSSIBLE_STATUSES.forEach((s) => availableOptions.add(s));
      }

      // Sort options based on the predefined order
      const otherOptions = Array.from(availableOptions).filter(
        (opt) => opt !== currentStatus
      );
      otherOptions.sort(
        (a, b) => ALL_POSSIBLE_STATUSES.indexOf(a) - ALL_POSSIBLE_STATUSES.indexOf(b)
      );

      return [currentStatus, ...otherOptions];
    },
    []
  );

  const availableStatusOptions = useMemo(() => {
    return ticket ? getAllowedNextStatuses(ticket.status) : [];
  }, [ticket, getAllowedNextStatuses]);

  // Handler for status changes
  const handleStatusChange = useCallback(
    async (newStatus: string) => {
      if (!ticket || ticket.status === newStatus) return; // Ignore if status is same

      const oldStatus = ticket.status; // Capture current *actual* ticket status for logging

      // Optimistically update the UI *first* so the user sees the dropdown change
      // This is for immediate visual feedback, the backend persistence is deferred for "Resolved"
      setTicket((prev) => ({
        ...prev!,
        status: newStatus as Ticket["status"],
      }));

      if (newStatus === "Resolved") {
        // If moving TO Resolved, defer persistence of status until remarks are saved.
        // But, open the remarks editor.
        setIsEditingRemarks(true);
        // Store the status *before* this optimistic UI change.
        // This 'originalStatus' will be used in handleSaveRemarks to determine
        // if the status change to 'Resolved' needs to be persisted.
        setOriginalStatus(oldStatus);
      } else {
        // If moving TO any status *other than* Resolved, or FROM Resolved to something else.
        // Persist immediately.
        const activityEntry = createActivityLogEntry(
          "Status Changed",
          oldStatus, // Use the *actual* status before this change for logging
          newStatus
        );
        await persistTicketUpdate(
          { status: newStatus as Ticket["status"] },
          [activityEntry] // Pass as array now
        );
        setOriginalStatus(newStatus as Ticket["status"]); // Update original status to the new persisted one

        // If we were editing remarks and status changed away from "Resolved", close remarks editor
        // and revert remarks text if they weren't saved.
        if (isEditingRemarks) {
          setIsEditingRemarks(false);
          setRemarksText(originalRemarks); // Revert remarks text if user didn't save them
        }
      }
    },
    [ticket, createActivityLogEntry, persistTicketUpdate, isEditingRemarks, originalRemarks] // Added dependencies
  );

  // Render loading state if ticket is null (though less likely with server components)
  if (!ticket || isLoadingOptions) { // Also check if options are loading
    return <div>Loading ticket details and options...</div>;
  }

  if (errorLoadingOptions) { // Display error if fetching options failed
    return <div className="text-red-600 p-4">Error: {errorLoadingOptions}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        {/* Tabs navigation */}
        <TabsList className="mx-4 mt-4 sticky top-0 z-10 flex-shrink-0 flex justify-center w-full">
          <TabsTrigger
            value="details"
            className="px-12 py-3 text-sm font-medium rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors text-blue-700 hover:bg-blue-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="px-12 py-3 text-sm font-medium rounded-lg focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors text-blue-700 hover:bg-blue-100 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
          >
            Activity
          </TabsTrigger>
        </TabsList>

        {/* Tabs content area */}
        <TabsContent
          value="details"
          className="flex-1 flex flex-col md:flex-row overflow-hidden mt-0 p-0"
        >
          {/* Left section: Title, Description, Comments */}
          <div className="flex flex-col flex-1 h-full">
            <div className="p-6">
              <div className="bg-white shadow-lg rounded-lg p-4 mx-auto">
                <TicketTitleEditor
                  title={ticket.subject.title}
                  originalTitle={originalTitle}
                  isEditing={isEditingTitle}
                  setIsEditing={setIsEditingTitle}
                  onSave={handleSaveTitle}
                  onCancel={handleCancelEditTitle}
                  onTitleChange={(newTitle) =>
                    setTicket((prev) => ({
                      ...prev!,
                      subject: { ...prev!.subject, title: newTitle },
                    }))
                  }
                  showHistory={showTitleHistory}
                  onToggleHistory={setShowTitleHistory}
                  submittedBy={ticket.name}
                />

                <TicketDescriptionEditor
                  description={ticket.subject.description}
                  originalDescription={originalDescription}
                  isEditing={isEditingDescription}
                  setIsEditing={setIsEditingDescription}
                  onSave={handleSaveDescription}
                  onCancel={handleCancelEditDescription}
                  onDescriptionChange={(newDescription) =>
                    setTicket((prev) => ({
                      ...prev!,
                      subject: { ...prev!.subject, description: newDescription },
                    }))
                  }
                  showHistory={showDescriptionHistory}
                  onToggleHistory={setShowDescriptionHistory}
                />
              </div>
            </div>

            {/* Comment Section */}
            <div className="flex-shrink-0 h-[40vh] px-6 rounded-sm">
              <span className="text-lg font-semibold text-gray-700">
                Comments
              </span>
              <CommentSection
                ticketId={ticket._id}
                onCommentAdded={handleCommentAdded}
              />
            </div>
          </div>

          {/* Right section: Sidebar with ticket details and editable fields */}
          <TicketSidebar
            ticket={ticket}
            availableStatusOptions={availableStatusOptions}
            onStatusChange={handleStatusChange}
            onFieldUpdate={handleFieldUpdate}
            remarksText={remarksText}
            setRemarksText={setRemarksText}
            isEditingRemarks={isEditingRemarks}
            handleSaveRemarks={handleSaveRemarks}
            handleCancelEditRemarks={handleCancelEditRemarks}
            isSaving={isSaving}
            originalRemarks={originalRemarks}
            organizationOptions={organizationOptions}
            platformOptions={platformOptions}
            attachments={ticket.attachments}
          />
        </TabsContent>

        {/* Activity Tab Content */}
        <TabsContent value="activity" className="flex-1 p-6 mt-0">
          <TicketActivityTab activities={ticket.activityLog || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketViewClient;
