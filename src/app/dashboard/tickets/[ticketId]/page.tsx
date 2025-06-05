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
import TicketViewClient from './TicketViewClient';




const STATUS_OPTIONS: Ticket['status'][] = ["New", "Open", "InProgress", "Hold", "Resolved", "Closed"];
const PRIORITY_OPTIONS: Priority[] = ["low", "medium", "high"];
const CATEGORY_OPTIONS: Ticket['category'][] = ["bugs", "Tech support", "new feature", "others"];

interface TicketInfoPageProps {
  params: {
    ticketId: string; // This will be the _id string
  };
}
export default async function TicketInfoPage({ params }: TicketInfoPageProps) {

    const ticketData = await fetchTicketById(params?.ticketId);
  
    if (!ticketData) {
      return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold">Ticket Not Found</h1>
          <p>The ticket with ID {params?.ticketId} could not be found.</p>
          <Link href="/dashboard" className="text-blue-500 hover:underline mt-4 inline-block">
            &larr; Back to Dashboard
          </Link>
        </div>
      );
    }
  
    // The activity log should ideally come from the ticketData fetched by API
    // Ensure your fetchTicketById populates ticketData.activityLog
    // For the first "Ticket Created" entry in activity log:
    // If your backend doesn't automatically add it when creating a ticket,
    // your frontend might need to construct it if it's not present.
    // Or, better, ensure the backend API for fetching a ticket also includes its activity.
    // For now, we'll assume `ticketData.activityLog` is populated.
    // If not, you might need to ensure your API returns it, or your Mongoose schema's
    // default for `activityLog` on new tickets includes the creation event.
  
    const initialTicketWithLog: Ticket = {
      ...ticketData,
      // Ensure activityLog is an array. If API might not return it, provide default
      activityLog: ticketData.activityLog || [ 
        {
          id: Date.now().toString(),
          timestamp: ticketData.createdAt, // Use actual ticket creation time
          user: "System",
          action: "Ticket Created",
        },
      ],
    };
  
  
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <div className="p-4 border-b bg-white flex justify-between items-center flex-shrink-0">
          <Link href="/dashboard" className="text-blue-500 hover:underline text-sm">
            &larr; Back to Dashboard
          </Link>
          {/* Display serialNumber if available, otherwise _id */}
          {/* <h2 className="text-xl font-semibold">Ticket: {ticketData.serialNumber || ticketData._id}</h2> */}
          <h2 className="text-xl font-semibold">
            Ticket : {ticketData.serialNumber ?? 'N/A'}
          </h2>

          <div></div>
        </div>
        <TicketViewClient initialTicket={initialTicketWithLog} />
      </div>
    );
  }

