// src/app/dashboard/tickets/[ticketId]/TicketViewClient.tsx
"use client";

import React, { useState, useEffect } from "react";
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

const STATUS_OPTIONS: Ticket["status"][] = [
  "New",
  "Open",
  "InProgress",
  "Hold",
  "Resolved",
  "Closed",
];
const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high"]; // Match your Priority type
const CATEGORY_OPTIONS: Ticket["category"][] = [
  "bugs",
  "Tech support",
  "new feature",
  "others",
];

interface TicketViewClientProps {
  initialTicket: Ticket;
}

const TicketViewClient: React.FC<TicketViewClientProps> = ({
  initialTicket,
}) => {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [activeTab, setActiveTab] = useState("details");
  console.log(ticket, "ticket"); // Debugging: Log the ticket object

  // State for editable fields
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [originalTitle, setOriginalTitle] = useState(
    initialTicket.subject.title
  );
  const [showTitleHistory, setShowTitleHistory] = useState(false);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [originalDescription, setOriginalDescription] = useState(
    initialTicket.subject.description
  );
  const [showDescriptionHistory, setShowDescriptionHistory] = useState(false);

  // Update local state if initialTicket prop changes (e.g., after a server action refresh)
  useEffect(() => {
    setTicket(initialTicket);
    setOriginalTitle(initialTicket.subject.title);
    setOriginalDescription(initialTicket.subject.description);
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
      user: "Ayush (You)",
      action,
      from,
      to,
      details,
    };
    setTicket((prev) => ({
      ...prev!,
      activityLog: [...(prev?.activityLog || []), newEntry],
    }));
    console.log(newEntry,"newEntry")
  };

  const createActivityLogEntry = (
    action: string,
    from: string,
    to: string
  ): ActivityLogEntry => {
    return {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: "Ayush (You)",
      action,
      from,
      to,
      details: `${action} from "${from}" to "${to}"`,
    };
  };
  

  // --- Handlers for edits ---
  // const handleFieldUpdate = async (
  //   fieldName: keyof Ticket | `subject.${"title" | "description"}`,
  //   newValue: any,
  //   originalValue: any
  // ) => {
  //   // TODO: API Call to PATCH /api/tickets/[ticket._id] with { [fieldName]: newValue }
  //   console.log(`Attempting to save ${fieldName}: ${newValue}`);
  //   // For nested subject fields
  //   if (typeof fieldName === "string" && fieldName.startsWith("subject.")) {
  //     const subField = fieldName.split(".")[1] as "title" | "description";
  //     // @ts-ignore
  //     addActivityLogEntry(
  //       `${subField.charAt(0).toUpperCase() + subField.slice(1)} Updated`,
  //       originalValue,
  //       newValue
  //     );
  //     // @ts-ignore
  //     setTicket((prev) => ({
  //       ...prev!,
  //       subject: { ...prev!.subject, [subField]: newValue },
  //     }));
  //   } else {
  //     // @ts-ignore
  //     addActivityLogEntry(
  //       `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} Changed`,
  //       originalValue,
  //       newValue
  //     );
  //     // @ts-ignore
  //     setTicket((prev) => ({ ...prev!, [fieldName]: newValue }));
  //   }
  //   // On successful API call, the local state is already updated optimistically.
  //   // If API fails, you might want to revert the state or show an error.
  // };


  // const handleFieldUpdate = async (
  //   fieldName: keyof Ticket | `subject.${"title" | "description"}`,
  //   newValue: any,
  //   originalValue: any
  // ) => {
  //   try {
  //     // Optimistically update UI
  //     if (typeof fieldName === "string" && fieldName.startsWith("subject.")) {
  //       const subField = fieldName.split(".")[1] as "title" | "description";
  //       addActivityLogEntry(
  //         `${subField.charAt(0).toUpperCase() + subField.slice(1)} Updated`,
  //         originalValue,
  //         newValue
  //       );
  //       setTicket((prev) => ({
  //         ...prev!,
  //         subject: { ...prev!.subject, [subField]: newValue },
  //       }));
  //     } else {
  //       addActivityLogEntry(
  //         `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} Changed`,
  //         originalValue,
  //         newValue
  //       );
  //       setTicket((prev) => ({ ...prev!, [fieldName]: newValue }));
  //     }
  
  //     // Send update to backend
  //     const response = await fetch(`/api/tickets/${ticket._id}`, {
  //       method: "PATCH",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ [fieldName]: newValue }),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error("Failed to update ticket");
  //     }
  
  //     // Optionally re-fetch ticket or merge server response
  //     // const updatedTicket = await response.json();
  //     // setTicket(updatedTicket);
  
  //   } catch (error) {
  //     console.error(error);
  //     // Optionally revert UI changes or notify user
  //   }
  // };

  const handleFieldUpdate = async (
    fieldName: keyof Ticket | `subject.${"title" | "description"}`,
    newValue: any,
    originalValue: any
  ) => {
    try {
      let updatedFields: any = {};
      let activityEntry: ActivityLogEntry;
  
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
      } else {
        activityEntry = createActivityLogEntry(
          `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} Changed`,
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
  
      // Send update to backend
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

  // const handleCommentAdded = async (commentText: string, author: string) => {
  //   // TODO: API Call to POST a new comment to /api/tickets/[ticket._id]/comments
  //   // The API should return the new comment object (with ID, timestamp from server)
  //   // and potentially the updated ticket document with the new comment & activity log.
  //   console.log(`New comment by ${author}: ${commentText}`);
  //   addActivityLogEntry(
  //     "Comment Added",
  //     undefined,
  //     undefined,
  //     `${author}: ${commentText}`
  //   );
  //   // For now, we're just logging it. In a real app, you'd update the comments list.
  //   // The CommentSection manages its own list for display, but the source of truth might come from ticket.comments
  // };
  const handleCommentAdded = async (commentText: string, author: string) => {
    const newEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: author,
      action: "Comment Added",
      from: undefined,
      to: undefined,
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
  
      // Optionally update local state
      setTicket((prev) => ({
        ...prev!,
        activityLog: [...(prev?.activityLog || []), newEntry],
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {" "}
      {/* Removed h-screen, parent will control height */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="mx-4 mt-4 sticky top-0 bg-white z-10 flex-shrink-0 flex justify-center w-full border-b">
          <TabsTrigger
            value="details"
            className="px-6 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="px-6 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="details"
          className="flex flex-col md:flex-row overflow-hidden mt-0 p-0"
        >
          <div className="flex flex-col flex-1 h-full">
            <div className="flex-grow overflow-y-auto p-6">
              <div className="bg-white shadow-lg rounded-lg p-6">
                {/* Editable Title */}
                <div className="mb-6 pb-4 border-b">
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
                            size="sm"
                            onClick={handleCancelEditTitle}
                          >
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleSaveTitle}>
                            Save Title
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <h1 className="text-3xl font-bold text-gray-800">
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
                <div>
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
                    <div className="space-y-4">
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
                        className="w-full"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          onClick={handleCancelEditDescription}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleSaveDescription}>
                          Save Description
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="prose max-w-none">
                      {ticket.subject.description}
                    </p>
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
              <h2 className="text-2xl font-bold mt-8 mb-4 px-6">
                Conversation History
              </h2>
            </div>
            <div className="flex-shrink-0 h-2/5 border-t">
              <CommentSection
                onCommentAdded={(commentText, author) =>
                  handleCommentAdded(commentText, author)
                }
              />
            </div>
          </div>

          <aside className="w-80 flex-shrink-0 border-l bg-gray-50 p-6 space-y-6 overflow-y-auto h-full">
            <h3 className="text-lg font-semibold border-b pb-2">
              Ticket Details
            </h3>
            <EditableField
              label="Status"
              value={ticket.status}
              options={STATUS_OPTIONS}
              onValueChange={(newVal) =>
                handleFieldUpdate("status", newVal, ticket.status)
              }
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
            <div>
              <label className="text-xs font-semibold text-gray-500">
                Organization ID
              </label>
              <p className="mt-1 text-sm">{ticket.Organization}</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500">
                Platform
              </label>
              <p className="mt-1 text-sm">{ticket.platformName}</p>
            </div>
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

        <TabsContent
          value="activity"
          className="flex-1 overflow-y-auto p-6 mt-0"
        >
          <ActivityTimeline activities={ticket.activityLog || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketViewClient;
