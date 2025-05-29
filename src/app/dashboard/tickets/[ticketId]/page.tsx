// src/app/dashboard/tickets/[ticketId]/page.tsx

// OPTION 1: SERVER COMPONENT (Recommended for data fetching)
import Link from 'next/link';
import { CommentSection } from '@/components/CommentSection';
import { EditableField } from '@/components/EditableField';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Ticket, Priority } from '@/types/ticket'; // Import Ticket type
// Assume you have a fetchTicketById function in lib/api.ts or similar
// This function would fetch from `${process.env.NEXT_PUBLIC_APP_URL}/api/tickets/${id}`
import {fetchTicketById} from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '../../columns';
import { CategoryBadge } from '../../columns';
import { PriorityBadge } from '../../columns';


// Badge components (should be client components or pure)
// const StatusBadge = ({ status }: { status: Ticket['status'] }) => { /* ... */ };
// const CategoryBadge = ({ category }: { category: Ticket['category'] }) => { /* ... */ };
// const PriorityBadge = ({ priority }: { priority: Priority }) => { /* ... */ };

const STATUS_OPTIONS: Ticket['status'][] = ["New", "Open", "InProgress", "Hold", "Resolved", "Closed"];
const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high"];
const CATEGORY_OPTIONS: Ticket['category'][] = ["bugs", "Tech support", "new feature", "others"];

interface TicketInfoPageProps {
  params: {
    ticketId: string; // This will be the _id string
  };
}

// Make this page an async Server Component
export default async function TicketInfoPage({ params }: TicketInfoPageProps) {
  const ticket = await fetchTicketById(params.ticketId); // fetchTicketById uses the _id

  if (!ticket) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Ticket Not Found</h1>
        <p>The ticket with ID {params.ticketId} could not be found.</p>
        <Link href="/dashboard" className="text-blue-500 hover:underline mt-4 inline-block">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  // Since this is a Server Component, interactive parts like editing state
  // would need to be moved into their own Client Components.
  // For now, let's focus on displaying data.
  // If you keep the page as a client component (with "use client"),
  // you'll need useEffect and useState for ticket data and edits as before.

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="p-4 border-b bg-white flex justify-between items-center flex-shrink-0">
        <Link href="/dashboard" className="text-blue-500 hover:underline text-sm">
          &larr; Back to Dashboard
        </Link>
        <h2 className="text-xl font-semibold">Ticket #{ticket.serialNumber}</h2> {/* Use _id */}
        <div></div>
      </div>

      <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden"> {/* defaultValue */}
        <TabsList className="mt-4 sticky top-0 bg-white z-10 flex-shrink-0 flex justify-center w-full border-b">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="flex-1 flex flex-col md:flex-row overflow-hidden mt-0 p-0">
          <div className="flex flex-col flex-1 h-full">
            <div className="flex-grow overflow-y-auto p-6">
              <div className="bg-white shadow-lg rounded-lg p-6">
                <div className="mb-6 pb-4 border-b">
                  <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold text-gray-800">{ticket.subject.title}</h1>
                    {/* Edit button would trigger client-side logic or a modal */}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Submitted by: {ticket.name}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-semibold text-gray-700">Description</h2>
                  </div>
                  <p className="prose max-w-none">{ticket.subject.description}</p>
                </div>
              </div>
              <h2 className="text-2xl font-bold mt-8 mb-4 px-6">Conversation History</h2>
            </div>
            <div className="flex-shrink-0 h-2/5 border-t">
              {/* Pass ticket._id or relevant data if CommentSection needs it */}
              {/* <CommentSection ticketId={ticket._id} onCommentAdded={...} /> */}
              <p className="p-4 text-center text-gray-500">(Comment Section Placeholder - requires client interactivity)</p>
            </div>
          </div>

          <aside className="w-80 flex-shrink-0 border-l bg-gray-50 p-6 space-y-6 overflow-y-auto h-full">
            <h3 className="text-lg font-semibold border-b pb-2">Ticket Details</h3>
            <div><label className="text-xs font-semibold text-gray-500">Status</label><div className="mt-1"><StatusBadge status={ticket.status} /></div></div>
            <div><label className="text-xs font-semibold text-gray-500">Priority</label><div className="mt-1"><PriorityBadge priority={ticket.priority} /></div></div>
            <div><label className="text-xs font-semibold text-gray-500">Category</label><div className="mt-1"><CategoryBadge category={ticket.category} /></div></div>
            <div><label className="text-xs font-semibold text-gray-500">Organization ID</label><p className="mt-1 text-sm">{ticket.Organization}</p></div>
            <div><label className="text-xs font-semibold text-gray-500">Platform</label><p className="mt-1 text-sm">{ticket.platformName}</p></div>
            <div>
              <label className="text-xs font-semibold text-gray-500">Date Created</label>
              <p className="mt-1 text-sm">
                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }) : 'N/A'}
              </p>
            </div>
          </aside>
        </TabsContent>

        <TabsContent value="activity" className="flex-1 overflow-y-auto p-6 mt-0">
          {/* <ActivityTimeline activities={ticket.activityLog || []} /> */}
          <p className="text-center text-gray-500">(Activity Timeline Placeholder)</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}