
// app/api/tickets/[id]/route.ts
import { connectDB } from '@/lib/db';
import {
  fetchTicket,
  patchTicket,
  removeTicket,
} from '@/controllers/ticketController';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const ticket = await fetchTicket(params.id);
  if (!ticket) {
    return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
  }
  return NextResponse.json(ticket);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const updates = await req.json();
  const updated = await patchTicket(params.id, updates);
  if (!updated) {
    return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const deleted = await removeTicket(params.id);
  if (!deleted) {
    return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Ticket deleted successfully' });
}
