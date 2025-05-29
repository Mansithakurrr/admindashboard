// src/lib/api.ts
import { Ticket, TicketStats } from '@/types/ticket'; // Assuming your types are in src/types/ticket.ts

const APP_URL = process.env.NEXT_PUBLIC_API_BASE_URL; // From your .env.local

if (!APP_URL) {
  // This check is more for client-side usage. On the server, it should always be available after build.
  // However, for consistency and to catch errors early during development:
  console.error("ERROR: NEXT_PUBLIC_API_BASE_URL is not defined in .env.local. API calls may fail.");
}

/**
 * Fetches a single ticket by its ID from your internal API
 */
export async function fetchTicketById(id: string): Promise<Ticket | null> {
  if (!APP_URL) {
    console.error("fetchTicketById: APP_URL is not defined.");
    return null;
  }
  try {
    const res = await fetch(`${APP_URL}/api/tickets/${id}`, {
      cache: 'no-store', // Ensures fresh data for individual ticket views
    });

    if (res.status === 404) {
      console.warn(`Ticket with id ${id} not found (404).`);
      return null; 
    }
    if (!res.ok) {
      const errorData = await res.text();
      console.error(`Failed to fetch ticket ${id}: ${res.status} ${res.statusText}`, errorData);
      throw new Error(`Failed to fetch ticket ${id}`);
    }
    return res.json();
  } catch (error) {
    console.error(`Error in fetchTicketById for id ${id}:`, error);
    return null;
  }
}

/**
 * Fetches all tickets from your internal API
 * (You are currently doing this in Dashboard.tsx, but it's good to have it here for consistency)
 */
export async function fetchAllTickets(): Promise<Ticket[]> {
  if (!APP_URL) {
    console.error("fetchAllTickets: APP_URL is not defined.");
    return [];
  }
  try {
    const res = await fetch(`${APP_URL}/api/tickets`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      const errorData = await res.text();
      console.error(`Failed to fetch tickets: ${res.status} ${res.statusText}`, errorData);
      throw new Error('Failed to fetch tickets');
    }
    const data = await res.json();
    return data.tickets || []; // Your API returns { tickets: [...] }
  } catch (error) {
    console.error("Error in fetchAllTickets:", error);
    return []; 
  }
}

/**
 * Fetches ticket stats from your internal API
 * (Good to have here for consistency if Dashboard.tsx uses it)
 */
export async function fetchTicketStats(): Promise<TicketStats> {
  if (!APP_URL) {
    console.error("fetchTicketStats: APP_URL is not defined.");
    return { total: 0, open: 0, resolved: 0, closed: 0 }; // Ensure TicketStats includes these
  }
  try {
    const res = await fetch(`${APP_URL}/api/tickets/stats`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      const errorData = await res.text();
      console.error(`Failed to fetch stats: ${res.status} ${res.statusText}`, errorData);
      throw new Error('Failed to fetch stats');
    }
    return res.json();
  } catch (error) {
    console.error("Error in fetchTicketStats:", error);
    // Ensure your TicketStats type includes all possible keys like Open, InProgress, Hold if they come from API
    return { total: 0, open: 0, resolved: 0, closed: 0 }; 
  }
}