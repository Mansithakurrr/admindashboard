// src/app/dashboard/tickets/[ticketId]/TicketViewClient.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Ticket, Priority, ActivityLogEntry, Comment as CommentType } from '@/types/ticket';
import Link from 'next/link';
import { CommentSection } from '@/components/CommentSection';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { EditableField } from '@/components/EditableField';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge, CategoryBadge, PriorityBadge } from '../../columns'; // Assuming these are exportable

const STATUS_OPTIONS: Ticket['status'][] = ["New", "Open", "InProgress", "Hold", "Resolved", "Closed"];
const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high"];
const CATEGORY_OPTIONS: Ticket['category'][] = ["bugs", "Tech support", "new feature", "others"];

interface TicketViewClientProps {
  initialTicket: Ticket;
}

const TicketViewClient: React.FC<TicketViewClientProps> = ({ initialTicket }) => {
  const [ticket, setTicket] = useState<Ticket>(initialTicket);
  const [activeTab, setActiveTab] = useState("details");

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [originalTitle, setOriginalTitle] = useState(initialTicket.subject.title);
  const [showTitleHistory, setShowTitleHistory] = useState(false);

  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [originalDescription, setOriginalDescription] = useState(initialTicket.subject.description);
  const [showDescriptionHistory, setShowDescriptionHistory] = useState(false);
  
  const [isSaving, setIsSaving] = useState(false); // For loading/disabled states

  useEffect(() => {
    setTicket(initialTicket);
    setOriginalTitle(initialTicket.subject.title);
    setOriginalDescription(initialTicket.subject.description);
  }, [initialTicket]);

  // --- THIS IS THE KEY FUNCTION TO UPDATE ---
  const updateTicketAndLogActivity = async (
    updates: Partial<Omit<Ticket, '_id' | 'serialNumber' | 'createdAt' | 'updatedAt' | 'activityLog'>> | { subject?: Partial<Ticket['subject']> },
    action: string,
    originalValue?: any,
    newValue?: any
  ) => {
    if (!ticket) return;
    setIsSaving(true);

    const activityEntry: ActivityLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: "Ayush (You)", // Replace with actual logged-in user logic
      action: action,
      from: originalValue !== undefined ? String(originalValue) : undefined,
      to: newValue !== undefined ? String(newValue) : undefined,
    };

    // Prepare payload for the backend
    // Your backend PATCH route expects { updates: {...}, newActivity: {...} }
    const payload = {
      updates: updates,
      newActivity: activityEntry,
    };

    try {
      console.log(`Sending PATCH to /api/tickets/${ticket._id} with payload:`, JSON.stringify(payload, null, 2));

      const res = await fetch(`/api/tickets/${ticket._id}`, { // Using relative URL for internal API
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error(`Failed to ${action.toLowerCase()}:`, errorData.message || res.statusText);
        // TODO: Show error toast to user
        // Optionally revert optimistic update or re-fetch initialTicket to be safe
        setTicket(initialTicket); 
        alert(`Error saving: ${errorData.message || res.statusText}`); // Simple alert for now
        return;
      }

      const updatedTicketFromServer: Ticket = await res.json();
      console.log("Received updated ticket from server:", updatedTicketFromServer);
      
      // Update the local state with the confirmed data from the server
      // This ensures the activityLog and any server-modified fields (like updatedAt) are fresh
      setTicket(updatedTicketFromServer);

      // Reset original values for history tracking if the field was updated
      if (updates.subject && 'title' in updates.subject && updates.subject.title !== undefined) {
        setOriginalTitle(updates.subject.title);
      }
      if (updates.subject && 'description' in updates.subject && updates.subject.description !== undefined) {
        setOriginalDescription(updates.subject.description);
      }
      // Add similar resets for status, priority, category if you want separate history for them

      console.log(`${action} successful and persisted.`);

    } catch (error) {
      console.error(`Error during ${action.toLowerCase()}:`, error);
      // TODO: Show error toast to user
      setTicket(initialTicket); // Revert on network error
      alert(`Network error during save. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  // --- SAVE HANDLERS NOW CALL updateTicketAndLogActivity ---
  const handleSaveTitle = () => {
    if (ticket && ticket.subject.title !== originalTitle) {
      updateTicketAndLogActivity(
        { subject: { title: ticket.subject.title } }, // Pass only the changed part
        "Subject Title Updated",
        originalTitle,
        ticket.subject.title
      );
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (ticket && ticket.subject.description !== originalDescription) {
      updateTicketAndLogActivity(
        { subject: { description: ticket.subject.description } },
        "Description Updated",
        // originalDescription, // For long text, might not be ideal to log full 'from'
        // ticket.subject.description
      );
    }
    setIsEditingDescription(false);
  };

  const handleStatusChange = (newStatus: string) => {
    if (ticket && ticket.status !== newStatus) {
      updateTicketAndLogActivity(
        { status: newStatus as Ticket['status'] },
        "Status Changed",
        ticket.status,
        newStatus
      );
    }
  };
  
  const handlePriorityChange = (newPriority: string) => {
    if (ticket && ticket.priority !== newPriority) {
      updateTicketAndLogActivity(
        { priority: newPriority as Priority },
        "Priority Changed",
        ticket.priority,
        newPriority
      );
    }
  };
  
  const handleCategoryChange = (newCategory: string) => {
    if (ticket && ticket.category !== newCategory) {
      updateTicketAndLogActivity(
        { category: newCategory as Ticket['category'] },
        "Category Changed",
        ticket.category,
        newCategory
      );
    }
  };
  
  const handleCommentAdded = async (commentText: string, author: string) => {
    if (!ticket) return;
    // For comments, it's often better to have a dedicated API endpoint like POST /api/tickets/[id]/comments
    // This endpoint would handle creating the comment and adding the activity log entry.
    // For now, let's simulate adding to the activity log locally and assume you'll build the comment API.
    
    const commentActivity: ActivityLogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: author,
      action: "Comment Added",
      details: commentText,
    };

    // TODO: API Call to POST the new comment.
    // Example:
    // const res = await fetch(`/api/tickets/${ticket._id}/comments`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text: commentText, author, newActivity: commentActivity }),
    // });
    // if (res.ok) {
    //   const updatedTicketWithNewComment = await res.json();
    //   setTicket(updatedTicketWithNewComment);
    // } else { /* handle error */ }

    // Optimistic local update for activity log for now
    setTicket(prev => ({ ...prev!, activityLog: [...(prev?.activityLog || []), commentActivity] }));
    console.log(`Comment by ${author}: ${commentText} - (API call to save comment needed)`);
  };

  // --- Other handlers ---
  const handleCancelEditTitle = () => {
    setTicket(prev => ({...prev!, subject: {...prev!.subject, title: originalTitle}}));
    setIsEditingTitle(false);
  };
  const hasTitleBeenEdited = ticket && ticket.subject.title !== originalTitle;

  const handleCancelEditDescription = () => {
    setTicket(prev => ({...prev!, subject: {...prev!.subject, description: originalDescription}}));
    setIsEditingDescription(false);
  };
  const hasDescriptionBeenEdited = ticket && ticket.subject.description !== originalDescription;


  if (!ticket) {
    return (
      <div className="container mx-auto p-4"><h1 className="text-2xl font-bold">Loading Ticket...</h1></div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4 mt-4 sticky top-0 bg-white z-10 flex-shrink-0 flex justify-center w-full border-b">
          <TabsTrigger value="details" className="px-6 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none focus-visible:ring-0 focus-visible:ring-offset-0">Details</TabsTrigger>
          <TabsTrigger value="activity" className="px-6 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none focus-visible:ring-0 focus-visible:ring-offset-0">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="flex-1 flex flex-col md:flex-row overflow-hidden mt-0 p-0">
          <div className="flex flex-col flex-1 h-full">
            <div className="flex-grow overflow-y-auto p-6">
              <div className="bg-white shadow-lg rounded-lg p-6">
                {/* Editable Title */}
                <div className="mb-6 pb-4 border-b">
                  <div className="flex justify-between items-start">
                    {isEditingTitle ? (
                      <div className="w-full space-y-2">
                        <Input value={ticket.subject.title} onChange={(e) => setTicket(prev => ({...prev!, subject: {...prev!.subject, title: e.target.value}}))} className="text-3xl font-bold" disabled={isSaving}/>
                        <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={handleCancelEditTitle} disabled={isSaving}>Cancel</Button>
                            <Button size="sm" onClick={handleSaveTitle} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Title'}</Button>
                        </div>
                      </div>
                    ) : <h1 className="text-3xl font-bold text-gray-800">{ticket.subject.title}</h1>}
                    {!isEditingTitle && <Button variant="outline" size="sm" className="ml-4 flex-shrink-0" onClick={() => setIsEditingTitle(true)} disabled={isSaving}>Edit Title</Button>}
                  </div>
                  {hasTitleBeenEdited && <div className="flex items-center space-x-2 mt-2"><Switch id="title-history-toggle" checked={showTitleHistory} onCheckedChange={setShowTitleHistory} /><Label htmlFor="title-history-toggle" className="text-xs font-semibold text-gray-600">Show Original Title</Label></div>}
                  <p className="text-sm text-gray-500 mt-1">Submitted by: {ticket.name}</p>
                </div>
                {hasTitleBeenEdited && showTitleHistory && (
                  <div className="mb-6 space-y-2 border-b pb-4">
                    <div className="p-2 bg-gray-100 rounded-md"><h4 className="text-xs font-bold text-gray-500">Original Title</h4><p className="text-sm text-gray-700">{originalTitle}</p></div>
                  </div>
                )}

                {/* Editable Description */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-700">Description</h2>
                    {!isEditingDescription && <Button variant="outline" size="sm" onClick={() => setIsEditingDescription(true)} disabled={isSaving}>Edit</Button>}
                  </div>
                  {isEditingDescription ? (
                    <div className="space-y-4">
                      <Textarea value={ticket.subject.description} onChange={(e) => setTicket(prev => ({...prev!, subject: {...prev!.subject, description: e.target.value}}))} rows={8} className="w-full" disabled={isSaving}/>
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" onClick={handleCancelEditDescription} disabled={isSaving}>Cancel</Button>
                        <Button onClick={handleSaveDescription} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Description'}</Button>
                      </div>
                    </div>
                  ) : <p className="prose max-w-none">{ticket.subject.description}</p>}
                </div>
                {hasDescriptionBeenEdited && <div className="flex items-center space-x-2 mt-6 border-t pt-4"><Switch id="desc-history-toggle" checked={showDescriptionHistory} onCheckedChange={setShowDescriptionHistory} /><Label htmlFor="desc-history-toggle" className="font-semibold text-gray-600">Show Original Description</Label></div>}
                {hasDescriptionBeenEdited && showDescriptionHistory && (
                  <div className="mt-4 space-y-4">
                    <div className="p-3 bg-gray-100 rounded-md"><h4 className="text-sm font-bold text-gray-500">Original Description</h4><p className="text-sm text-gray-700 mt-1">{originalDescription}</p></div>
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold mt-8 mb-4 px-6">Conversation History</h2>
            </div>
            <div className="flex-shrink-0 h-2/5 border-t">
              <CommentSection onCommentAdded={handleCommentAdded} />
            </div>
          </div>

          <aside className="w-80 flex-shrink-0 border-l bg-gray-50 p-6 space-y-6 overflow-y-auto h-full">
            <h3 className="text-lg font-semibold border-b pb-2">Ticket Details</h3>
            <EditableField label="Status" value={ticket.status} options={STATUS_OPTIONS} onValueChange={handleStatusChange} renderValue={(value) => <StatusBadge status={value as Ticket['status']} />}/>
            <EditableField label="Priority" value={ticket.priority} options={PRIORITY_OPTIONS} onValueChange={handlePriorityChange} renderValue={(value) => <PriorityBadge priority={value as Priority} />} />
            <EditableField label="Category" value={ticket.category} options={CATEGORY_OPTIONS} onValueChange={handleCategoryChange} renderValue={(value) => <CategoryBadge category={value as Ticket['category']} />} />
            <div><label className="text-xs font-semibold text-gray-500">Organization ID</label><p className="mt-1 text-sm">{ticket.Organization}</p></div>
            <div><label className="text-xs font-semibold text-gray-500">Platform</label><p className="mt-1 text-sm">{ticket.platformName}</p></div>
            <div><label className="text-xs font-semibold text-gray-500">Date Created</label><p className="mt-1 text-sm">{new Date(ticket.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</p></div>
          </aside>
        </TabsContent>

        <TabsContent value="activity" className="flex-1 overflow-y-auto p-6 mt-0">
          <ActivityTimeline activities={ticket.activityLog || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TicketViewClient;