// app/api/tickets/route.ts
import { connectDB } from '@/lib/db';
import { fetchTickets, postTicket } from '@/controllers/ticketController';
import { NextRequest, NextResponse } from 'next/server';
import Ticket from '@/models/Ticket';

// export async function GET(req: NextRequest) {
//   await connectDB();
//   const url = new URL(req.url);
//   const result = await fetchTickets(url.searchParams);
//   return NextResponse.json(result);
// }

// export async function GET(req: NextRequest) {
//   try {
//     await connectDB();
//     const url = new URL(req.url);
//     const result = await fetchTickets(url.searchParams);
//     return NextResponse.json(result);
//   } catch (error) {
//     console.error('Error fetching tickets:', error);
//     return NextResponse.json({ message: "Failed to fetch tickets" }, { status: 500 });
//   }
// }

export async function GET() {
  try {
    await connectDB(); // ensure DB is connected
    const tickets = await Ticket.find({});
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("API /api/tickets error:", error);
    return NextResponse.json({ message: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const ticket = await postTicket(body);
  return NextResponse.json(ticket);
}
