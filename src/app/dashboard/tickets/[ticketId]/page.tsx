// src/app/dashboard/tickets/[ticketId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
// import { recentTickets, Ticket, Priority } from "@/lib/mockData";
import { Ticket } from "@/types/ticket";
import Link from "next/link";
import { CommentSection } from "@/components/CommentSection";
import { useParams } from "next/navigation";
import { EditableField } from "@/components/EditableField";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Import Input for the title
import { StatusBadge } from "@/app/dashboard/columns";
import { CategoryBadge } from "@/app/dashboard/columns";
import { PriorityBadge } from "@/app/dashboard/columns";

// Badge components...
// const StatusBadge = ({ status }: { status: Ticket["status"] }) => {
//   const classes = {
//     New: "bg-blue-100 text-blue-800",
//     Open: "bg-orange-100 text-orange-800",
//     InProgress: "bg-purple-100 text-purple-800",
//     Hold: "bg-red-100 text-red-800",
//     Resolved: "bg-green-100 text-green-800",
//     Closed: "bg-gray-100 text-gray-800",
//   };
//   return (
//     <span
//       className={`px-2 py-1 text-xs font-semibold rounded-full ${classes[status]}`}
//     >
//       {status}
//     </span>
//   );
// };
// const CategoryBadge = ({ category }: { category: Ticket["category"] }) => {
//   const classes = {
//     bugs: "bg-red-100 text-red-800",
//     "Tech support": "bg-blue-100 text-blue-800",
//     "new feature": "bg-purple-100 text-purple-800",
//     others: "bg-gray-100 text-gray-800",
//   };
//   return (
//     <span
//       className={`px-2 py-1 text-xs font-semibold rounded-full ${classes[category]}`}
//     >
//       {category}
//     </span>
//   );
// };
// const PriorityBadge = ({ priority }: { priority: Ticket["priority"] }) => {
//   const classes = {
//     Low: "bg-gray-100 text-gray-800",
//     Medium: "bg-yellow-100 text-yellow-800",
//     High: "bg-orange-100 text-orange-800",
//     Urgent: "bg-red-100 text-red-800",
//   };
//   return (
//     <span
//       className={`px-2 py-1 text-xs font-semibold rounded-full ${classes[priority]}`}
//     >
//       {priority}
//     </span>
//   );
// };

const STATUS_OPTIONS: Ticket["status"][] = [
  "New",
  "Open",
  "InProgress",
  "Hold",
  "Resolved",
  "Closed",
];
const PRIORITY_OPTIONS: Ticket["priority"][] = ["low", "medium", "high"];

const TicketInfoPage = () => {
  const params = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  // STATE FOR DESCRIPTION
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [originalDescription, setOriginalDescription] = useState("");
  const [showDescriptionHistory, setShowDescriptionHistory] = useState(false);

  // 1. NEW STATE VARIABLES FOR TITLE
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [originalTitle, setOriginalTitle] = useState("");
  const [showTitleHistory, setShowTitleHistory] = useState(false);

  // useEffect(() => {
  //   if (params.ticketId) {
  //     const ticketId = parseInt(params.ticketId as string, 10);
  //     const foundTicket = recentTickets.find((t) => t.sno === ticketId);
  //     setTicket(foundTicket || null);

  //     if (foundTicket) {
  //       // 2. SAVE ORIGINAL STATE FOR BOTH TITLE AND DESCRIPTION
  //       setOriginalTitle(foundTicket.subject.title);
  //       setOriginalDescription(foundTicket.subject.description);
  //     }
  //   }
  // }, [params.ticketId]);


  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`/api/tickets/${params.ticketId}`);
        const data = await res.json();
        setTicket(data);
  
        setOriginalTitle(data.subject.title);
        setOriginalDescription(data.subject.description);
      } catch (err) {
        console.error("Failed to fetch ticket", err);
      }
    };
  
    if (params.ticketId) {
      fetchTicket();
    }
  }, [params.ticketId]);

  
  // --- DESCRIPTION HANDLERS ---
  const handleSaveDescription = () => {
    setIsEditingDescription(false);
    console.log("Description saved:", ticket?.subject.description);
  };
  const handleCancelEditDescription = () => {
    if (ticket) {
      setTicket({
        ...ticket,
        subject: { ...ticket.subject, description: originalDescription },
      });
    }
    setIsEditingDescription(false);
  };
  const hasDescriptionBeenEdited =
    ticket && ticket.subject.description !== originalDescription;

  // 3. NEW HANDLER FUNCTIONS FOR TITLE
  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    console.log("Title saved:", ticket?.subject.title);
  };
  const handleCancelEditTitle = () => {
    if (ticket) {
      setTicket({
        ...ticket,
        subject: { ...ticket.subject, title: originalTitle },
      });
    }
    setIsEditingTitle(false);
  };
  const hasTitleBeenEdited = ticket && ticket.subject.title !== originalTitle;

  if (!ticket) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Loading Ticket...</h1>
      </div>
    );
  }

  function handlePriorityChange(newValue: string): void {
    throw new Error("Function not implemented.");
  }

  function handleStatusChange(newValue: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {/* Left side: Main ticket info and comments */}
        <div className="flex flex-col flex-1">
          <div className="flex-grow overflow-y-auto p-6">
            <div className="bg-white shadow-lg rounded-lg p-6">
              <div className="mb-6 pb-4 border-b">
                {/* 4. EDITABLE TITLE SECTION */}
                <div className="flex justify-between items-start">
                  {isEditingTitle ? (
                    <div className="w-full space-y-2">
                      <Input
                        value={ticket.subject.title}
                        onChange={(e) =>
                          setTicket({
                            ...ticket,
                            subject: {
                              ...ticket.subject,
                              title: e.target.value,
                            },
                          })
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
                {/* History Toggle for Title */}
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

              {/* History View for Title */}
              {hasTitleBeenEdited && showTitleHistory && (
                <div className="mb-6 space-y-2 border-b pb-4">
                  <div className="p-2 bg-gray-100 rounded-md">
                    <h4 className="text-xs font-bold text-gray-500">
                      Original Title
                    </h4>
                    <p className="text-sm text-gray-700">{originalTitle}</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded-md">
                    <h4 className="text-xs font-bold text-green-800">
                      Current Title
                    </h4>
                    <p className="text-sm text-green-900">
                      {ticket.subject.title}
                    </p>
                  </div>
                </div>
              )}

              {/* EDITABLE DESCRIPTION SECTION */}
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
                        setTicket({
                          ...ticket,
                          subject: {
                            ...ticket.subject,
                            description: e.target.value,
                          },
                        })
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
                  <div className="p-3 bg-green-50 rounded-md">
                    <h4 className="text-sm font-bold text-green-800">
                      Current Description
                    </h4>
                    <p className="text-sm text-green-900 mt-1">
                      {ticket.subject.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <h2 className="text-2xl font-bold mt-8 mb-4">
              Conversation History
            </h2>
          </div>
          <div className="flex-shrink-0 h-2/5 border-t">
            <CommentSection />
          </div>
        </div>

        {/* Right side: Details Panel */}
        <aside className="w-80 flex-shrink-0 border-l bg-gray-50 p-6 space-y-6">
          <h3 className="text-lg font-semibold border-b pb-2">
            Ticket Details
          </h3>
          <EditableField
            label="Status"
            value={ticket.status}
            options={STATUS_OPTIONS}
            onValueChange={handleStatusChange}
            renderValue={(value) => (
              <StatusBadge status={value as Ticket["status"]} />
            )}
          />
          <EditableField
            label="Priority"
            value={ticket.priority}
            options={PRIORITY_OPTIONS}
            onValueChange={handlePriorityChange}
            renderValue={(value) => (
              <PriorityBadge priority={value as Ticket["priority"]} />
            )}
          />
          <div>
            <label className="text-xs font-semibold text-gray-500">
              Category
            </label>
            <div className="mt-1">
              <CategoryBadge category={ticket.category} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">
              Organization ID
            </label>
            <p className="mt-1 text-sm">{ticket.Organization}</p>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">
              Platform ID
            </label>
            <p className="mt-1 text-sm">{ticket.platformName}</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TicketInfoPage;
