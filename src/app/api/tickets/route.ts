// app/api/tickets/route.ts
import { connectDB } from '@/lib/db';
import { fetchTickets, postTicket } from '@/controllers/ticketController';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  await connectDB();
  const url = new URL(req.url);
  const result = await fetchTickets(url.searchParams);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();
  const ticket = await postTicket(body);
  return NextResponse.json(ticket);
}
