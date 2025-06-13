// src/app/dashboard/tickets/[ticketId]/TicketViewClient.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Ticket,
  Priority,
  ActivityLogEntry,
  Comment as CommentType,
} from "@/types/ticket";
import Link from "next/link";
import { CommentSection } from "@/components/CommentSection"; // You'll need to pass update functions to this
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { EditableField } from "@/components/EditableField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, CategoryBadge, PriorityBadge } from "../../columns"; // Assuming these are exportable

const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high"]; // Match your Priority type
const CATEGORY_OPTIONS: Ticket["category"][] = [
  "bugs",
  "Tech support",
  "new feature",
  "others",
];
const ORGANIZATION_OPTIONS: Ticket["orgId"][] = [
  "MSIL",
  "Rohtak",
  "Tag Avenue",
  "Udhyog Vihar",
];

const PLATFORM_OPTIONS: Ticket["platformId"][] = [
  "Light house",
  "Learn Tank",
  "Home Certify",
];

interface TicketViewClientProps {
  initialTicket: Ticket;
}

const TicketViewClient: React.FC<TicketViewClientProps> = ({
  initialTicket,
}) => {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [activeTab, setActiveTab] = useState("details");

  // State for editable fields
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [originalTitle, setOriginalTitle] = useState(
    initialTicket.subject.title
  );
  const [isSaving, setIsSaving] = useState(false);

  const [showTitleHistory, setShowTitleHistory] = useState(false);
  const [originalStatus, setOriginalStatus] = useState(initialTicket.status);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [originalDescription, setOriginalDescription] = useState(
    initialTicket.subject.description
  );
  const [showDescriptionHistory, setShowDescriptionHistory] = useState(false);
  const [isEditingRemarks, setIsEditingRemarks] = useState(false);
  const [originalRemarks, setOriginalRemarks] = useState(
    initialTicket.resolvedRemarks || ""
  );
  const [showRemarksHistory, setShowRemarksHistory] = useState(false); // Optional: if you want history for remarks
  const [isEditingOrganisation, setIsEditingOrganisation] = useState(false);

  const [remarksText, setRemarksText] = useState(
    initialTicket.resolvedRemarks || ""
  );

  // Update local state if initialTicket prop changes (e.g., after a server action refresh)
  useEffect(() => {
    setTicket(initialTicket);
    setOriginalTitle(initialTicket.subject.title);
    setOriginalDescription(initialTicket.subject.description);
    setOriginalRemarks(initialTicket.resolvedRemarks || "");
    setOriginalStatus(initialTicket.status);
  }, [initialTicket]);

  const addActivityLogEntry = (
    action: string,
    from?: string,
    to?: string,
    details?: string
  ) => {
    if (!ticket) return;

    const newEntry: ActivityLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: "You",
      action,
      from,
      to,
      details,
    };
    setTicket((prev) => ({
      ...prev!,
      activityLog: [...(prev?.activityLog || []), newEntry],
    }));
    console.log(newEntry, "newEntry");
  };

  const createActivityLogEntry = (
    action: string,
    from: string,
    to: string
  ): ActivityLogEntry => {
    return {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: "You",
      action,
      from,
      to,
      details: `${action} from "${from}" to "${to}"`,
    };
  };

  const handleFieldUpdate = async (
    fieldName:
      | keyof Ticket
      | `subject.${"title" | "description"}`
      | "platformData"
      | "organizationData",
    newValue: any,
    originalValue: any
  ) => {
    try {
      let updatedFields: any = {};
      let activityEntry: ActivityLogEntry;

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
        const subField = fieldName.split(".")[1] as "title" | "description";

        activityEntry = createActivityLogEntry(
          `${subField.charAt(0).toUpperCase() + subField.slice(1)} Updated`,
          originalValue,
          newValue
        );

        updatedFields = {
          subject: { ...ticket.subject, [subField]: newValue },
          $push: { activityLog: activityEntry },
        };

        setTicket((prev) => ({
          ...prev!,
          subject: { ...prev!.subject, [subField]: newValue },
          activityLog: [...(prev?.activityLog || []), activityEntry],
        }));
      }

      else if (fieldName === "platformData") {
        const { platformId, platformName } = newValue;

        activityEntry = createActivityLogEntry(
          "Platform Changed",
          originalValue.platformName,
          platformName
        );

        updatedFields = {
          platformId,
          platformName,
          $push: { activityLog: activityEntry },
        };

        setTicket((prev) => ({
          ...prev!,
          platformId,
          platformName,
          activityLog: [...(prev?.activityLog || []), activityEntry],
        }));
      }

      else if (fieldName === "organizationData") {
        const { orgId, organizationName } = newValue;

        activityEntry = createActivityLogEntry(
          "Organization Changed",
          originalValue.organizationName,
          organizationName
        );

        updatedFields = {
          orgId,
          organizationName,
          $push: { activityLog: activityEntry },
        };

        setTicket((prev) => ({
          ...prev!,
          orgId,
          organizationName,
          activityLog: [...(prev?.activityLog || []), activityEntry],
        }));
      }

      else {
        activityEntry = createActivityLogEntry(
          `${getFieldLabel(fieldName)} Changed`,
          originalValue,
          newValue
        );

        updatedFields = {
          [fieldName]: newValue,
          $push: { activityLog: activityEntry },
        };

        setTicket((prev) => ({
          ...prev!,
          [fieldName]: newValue,
          activityLog: [...(prev?.activityLog || []), activityEntry],
        }));
      }

      const response = await fetch(`/api/tickets/${ticket._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) {
        throw new Error("Failed to update ticket");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveTitle = () => {
    if (ticket.subject.title !== originalTitle) {
      handleFieldUpdate("subject.title", ticket.subject.title, originalTitle);
    }
    setIsEditingTitle(false);
  };

  const handleCancelEditTitle = () => {
    setTicket((prev) => ({
      ...prev!,
      subject: { ...prev!.subject, title: originalTitle },
    }));
    setIsEditingTitle(false);
  };
  const hasTitleBeenEdited = ticket.subject.title !== originalTitle;
  const handleSaveRemarks = async () => {
    if (!ticket) return;

    // 1. Validation check

    if (ticket.status !== "Resolved") {
      alert("Ticket is not resolved");
      return;
    }

    if (!remarksText || remarksText.trim() === "") {
      alert("Resolution remarks are required to mark this ticket as Resolved.");
      return;
    }

    setIsSaving(true);
    try {
      // 2. First, persist the new status
      const statusUpdatePayload = { status: ticket.status };
      await persistTicketUpdate(statusUpdatePayload);

      // 3. Then, if remarks exist, persist them to the dedicated endpoint

      console.log(`Sending PATCH to /api/tickets/${ticket._id}/remarks`);
      const remarksResponse = await fetch(
        `/api/tickets/${ticket._id}/remarks`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remarks: remarksText }),
        }
      );

      if (!remarksResponse.ok) {
        const errorData = await remarksResponse.json();
        throw new Error(errorData.message || "Failed to save remarks");
      }

      const finalUpdatedTicket = await remarksResponse.json();

      console.log({ ticket, finalUpdatedTicket });
      // The final response should be the fully updated ticket, set it as the source of truth
      setTicket(finalUpdatedTicket);

      // 4. Update local "original" state and exit edit mode
      setOriginalStatus(ticket.status);
      setOriginalRemarks(ticket.resolvedRemarks || "");
      setIsEditingRemarks(false);
    } catch (error: any) {
      console.error("Error during save process:", error.message);
      // Revert the local state to the initial state on failure
      setTicket(initialTicket);
      alert(`Error during save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditRemarks = () => {
    // When cancelling, revert both status and remarks to their original state.
    setTicket((prev) => ({
      ...prev!,
      status: originalStatus,
      resolvedRemarks: originalRemarks,
    }));
    setIsEditingRemarks(false);
  };
  const hasRemarksBeenEdited =
    ticket && (ticket.resolvedRemarks || "") !== originalRemarks;

  const handleSaveDescription = () => {
    if (ticket.subject.description !== originalDescription) {
      handleFieldUpdate(
        "subject.description",
        ticket.subject.description,
        originalDescription
      );
    }
    setIsEditingDescription(false);
  };

  const handleCancelEditDescription = () => {
    setTicket((prev) => ({
      ...prev!,
      subject: { ...prev!.subject, description: originalDescription },
    }));
    setIsEditingDescription(false);
  };
  const hasDescriptionBeenEdited =
    ticket.subject.description !== originalDescription;

  const handleCommentAdded = async (commentText: string, author: string) => {
    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: author,
      action: "Comment Added",
      // from: undefined,
      // to: undefined,
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

      // Refetch updated ticket from backend
      const updatedTicket = await fetch(`/api/tickets/${ticket._id}`).then((r) =>
        r.json()
      );
      setTicket(updatedTicket);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (ticket && ticket.status !== newStatus) {
      // Just update the UI state optimistically.
      setTicket((prev) => ({
        ...prev!,
        status: newStatus as Ticket["status"],
      }));

      // If the user selects "Resolved", make the remarks box appear but DON'T save to the database yet.
      if (newStatus === "Resolved") {
        setIsEditingRemarks(true);
      } else {
        // If they select any OTHER status (e.g., Hold, InProgress), save it immediately.
        persistTicketUpdate({ status: newStatus as Ticket["status"] });
      }
    }
  };

  const persistTicketUpdate = async (updates: Partial<Ticket>) => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/tickets/${ticket._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error("Failed to update ticket");

      const updatedTicket = await res.json();
      setTicket(updatedTicket);
    } catch (error) {
      console.error("Error updating ticket:", error);
    } finally {
      setIsSaving(false);
    }
  };
  const ALL_POSSIBLE_STATUSES: Ticket["status"][] = [
    "New",
    "Open",
    "InProgress",
    "Hold",
    "Resolved",
    "Closed",
  ];

  const getAllowedNextStatuses = (
    currentStatus: Ticket["status"]
  ): Ticket["status"][] => {
    const availableOptions = new Set<Ticket["status"]>();
    // Always include the current status as the first option in the dropdown.
    availableOptions.add(currentStatus);

    switch (currentStatus) {
      case "New":
        // Rule 1: New can only be set to "Open".
        availableOptions.add("Open");
        break;
      case "Open":
        // Rule 2: Open can only be set to "InProgress", "Hold", "Resolved", or "Closed".
        availableOptions.add("InProgress");
        availableOptions.add("Hold");
        availableOptions.add("Resolved");
        availableOptions.add("Closed");
        break;
      case "InProgress":
        // Rule 3: InProgress can only be set to "Hold", "Resolved", or "Closed".
        availableOptions.add("Hold");
        availableOptions.add("Resolved");
        availableOptions.add("Closed");
        break;
      case "Hold":
        // Rule 4: Hold can only be set to "InProgress", "Resolved", "Closed".
        availableOptions.add("InProgress");
        availableOptions.add("Resolved");
        availableOptions.add("Closed");
        break;
      case "Resolved":
        // Rule 5: Resolved can only be set to "Closed".
        availableOptions.add("Closed");
        break;
      case "Closed":
        // Rule 6: Closed cannot be changed. Only "Closed" itself will be an option.
        break;
      default:
        // Fallback in case of an unexpected status (shouldn't happen with TypeScript)
        ALL_POSSIBLE_STATUSES.forEach((s) => availableOptions.add(s));
    }

    // Convert the Set to an array.
    // To ensure a consistent order in the dropdown (after the current status),
    // we can sort the additional options based on their order in ALL_POSSIBLE_STATUSES.
    const otherOptions = Array.from(availableOptions).filter(
      (opt) => opt !== currentStatus
    );
    otherOptions.sort(
      (a, b) =>
        ALL_POSSIBLE_STATUSES.indexOf(a) - ALL_POSSIBLE_STATUSES.indexOf(b)
    );

    return [currentStatus, ...otherOptions];
  };

  const availableStatusOptions = useMemo(() => {
    if (!ticket) return []; // If ticket isn't loaded yet, return empty array
    return getAllowedNextStatuses(ticket.status);
  }, [ticket?.status]); 

  if (!ticket) {
    return <div>Loading...</div>;
  }
  return (
    <div className="flex flex-col h-full">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
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

        <TabsContent
          value="details"
          className="flex-1 flex flex-col md:flex-row overflow-hidden mt-0 p-0"
        >
          <div className="flex flex-col flex-1 h-full">
            <div className="p-6">
              <div className="bg-white shadow-lg rounded-lg p-4 mx-auto">
                {/* Editable Title */}
                <div className="mb-6 pb-4 border-b ">
                  <h2 className="text-xl font-semibold text-gray-700">Title</h2>
                  <div className="flex justify-between items-start">
                    {isEditingTitle ? (
                      <div className="w-full space-y-2">
                        <Input
                          value={ticket.subject.title}
                          onChange={(e) =>
                            setTicket((prev) => ({
                              ...prev!,
                              subject: {
                                ...prev!.subject,
                                title: e.target.value,
                              },
                            }))
                          }
                          className="text-3xl font-bold"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            onClick={handleCancelEditTitle}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="bg-blue-500 hover:bg-blue-600"
                            onClick={handleSaveTitle}
                          >
                            Save Title
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <h1 className="text-3xl break-all font-bold text-gray-800">
                        {ticket.subject.title}
                      </h1>
                    )}
                    {!isEditingTitle && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-4 flex-shrink-0"
                        onClick={() => setIsEditingTitle(true)}
                      >
                        Edit Title
                      </Button>
                    )}
                  </div>
                  {hasTitleBeenEdited && (
                    <div className="flex items-center space-x-2 mt-2">
                      <Switch
                        id="title-history-toggle"
                        checked={showTitleHistory}
                        onCheckedChange={setShowTitleHistory}
                      />
                      <Label
                        htmlFor="title-history-toggle"
                        className="text-xs font-semibold text-gray-600"
                      >
                        Show Title History
                      </Label>
                    </div>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted by: {ticket.name}
                  </p>
                </div>
                {hasTitleBeenEdited && showTitleHistory && (
                  <div className="mb-6 space-y-2 border-b pb-4">
                    <div className="p-2 bg-gray-100 rounded-md">
                      <h4 className="text-xs font-bold text-gray-500">
                        Original Title
                      </h4>
                      <p className="text-sm text-gray-700">{originalTitle}</p>
                    </div>
                  </div>
                )}

                {/* Editable Description */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-700">
                      Description
                    </h2>
                    {!isEditingDescription && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingDescription(true)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  {isEditingDescription ? (
                    <div className="max-w-full">
                      <Textarea
                        value={ticket.subject.description}
                        onChange={(e) =>
                          setTicket((prev) => ({
                            ...prev!,
                            subject: {
                              ...prev!.subject,
                              description: e.target.value,
                            },
                          }))
                        }
                        rows={8}
                        className="w-full max-h-[20px]"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          className="mt-2"
                          onClick={handleCancelEditDescription}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="mt-2 bg-blue-500 hover:bg-blue-600"
                          onClick={handleSaveDescription}
                        >
                          Save Description
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="break-all">{ticket.subject.description}</p>
                  )}
                </div>
                {hasDescriptionBeenEdited && (
                  <div className="flex items-center space-x-2 mt-6 border-t pt-4">
                    <Switch
                      id="desc-history-toggle"
                      checked={showDescriptionHistory}
                      onCheckedChange={setShowDescriptionHistory}
                    />
                    <Label
                      htmlFor="desc-history-toggle"
                      className="font-semibold text-gray-600"
                    >
                      Show Description History
                    </Label>
                  </div>
                )}
                {hasDescriptionBeenEdited && showDescriptionHistory && (
                  <div className="mt-4 space-y-4">
                    <div className="p-3 bg-gray-100 rounded-md">
                      <h4 className="text-sm font-bold text-gray-500">
                        Original Description
                      </h4>
                      <p className="text-sm text-gray-700 mt-1">
                        {originalDescription}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* <div className="flex justify-start items-center">
             
              
            </div> */}
            <div className="flex-shrink-0 h-[40vh] px-6 rounded-sm">
              <span className="text-lg font-semibold text-gray-700">
                Comments
              </span>
              <CommentSection
                ticketId={ticket._id}
                onCommentAdded={(commentText, author) =>
                  handleCommentAdded(commentText, author)
                }
              />
            </div>
          </div>

          {/* Ticket Details */}
          <aside className="w-80 flex-shrink-0 border-l bg-gray-50 p-6 space-y-6 overflow-y-auto h-full">
            <h3 className="text-lg font-semibold border-b pb-2">
              Ticket Details
            </h3>

            {ticket.status === "Resolved" && !ticket.resolvedRemarks && (
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
            {ticket.resolvedRemarks && (
              <div>
                <label className="text-xs font-semibold text-gray-500">
                  Resolution Remarks
                </label>
                <p className="mt-1 text-sm text-gray-700 bg-gray-100 p-3 rounded-md border break-words">
                  {ticket.resolvedRemarks}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <EditableField
                label="Status"
                value={ticket.status}
                options={availableStatusOptions}
                onValueChange={handleStatusChange}
                renderValue={(value) => (
                  <StatusBadge status={value as Ticket["status"]} />
                )}
              />
              <EditableField
                label="Priority"
                value={ticket.priority}
                options={PRIORITY_OPTIONS}
                onValueChange={(newVal) =>
                  handleFieldUpdate("priority", newVal, ticket.priority)
                }
                renderValue={(value) => (
                  <PriorityBadge priority={value as Priority} />
                )}
              />
              <EditableField
                label="Category"
                value={ticket.category}
                options={CATEGORY_OPTIONS}
                onValueChange={(newVal) =>
                  handleFieldUpdate("category", newVal, ticket.category)
                }
                renderValue={(value) => (
                  <CategoryBadge category={value as Ticket["category"]} />
                )}
              />
              <EditableField
                label="Organization"
                value={ticket.organizationName || ""}
                options={ORGANIZATION_OPTIONS}
                onValueChange={(newVal) => {
                  const selectedOption = ORGANIZATION_OPTIONS.find((opt) => opt === newVal);
                  handleFieldUpdate("organizationData", {
                    orgId: newVal,
                    organizationName: selectedOption || "",
                  }, {
                    orgId: ticket.orgId,
                    organizationName: ticket.organizationName,
                  });
                }}
              />


              <EditableField
                label="Platform"
                value={ticket.platformName || ""}
                options={PLATFORM_OPTIONS}
                onValueChange={(newVal) => {
                  const selectedOption = PLATFORM_OPTIONS.find((opt) => opt === newVal);
                  handleFieldUpdate("platformData", {
                    platformId: newVal,
                    platformName: selectedOption || "",
                  }, {
                    platformId: ticket.platformId,
                    platformName: ticket.platformName,
                  });
                }}
              />


            </div>

            {ticket.attachments?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Attachments</h3>
                <div className="max-h-64 overflow-y-auto pr-1 space-y-3">
                  {ticket.attachments.map((attachment: { url: string; originalName: string; }, index: number) => {
                    const fileName = attachment.url.split("/").pop();
                    const fileExt = fileName?.split(".").pop()?.toLowerCase();
                    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExt || "");

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 border rounded bg-white shadow-sm"
                      >
                        {isImage ? (
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={attachment.url}
                              alt={`attachment-${index + 1}`}
                              className="w-16 h-16 object-cover rounded"
                            />
                          </a>
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center border rounded bg-gray-100 text-gray-500 text-xs">
                            {fileExt?.toUpperCase()}
                          </div>
                        )}

                        <div className="flex flex-col gap-1 truncate">
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
        </TabsContent>

        <TabsContent value="activity" className="flex-1 p-6 mt-0">
          <ActivityTimeline activities={ticket.activityLog || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketViewClient;
function persistTicketUpdate(arg0: { resolvedRemarks: string }) { }
