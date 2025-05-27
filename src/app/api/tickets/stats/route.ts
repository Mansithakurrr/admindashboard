// app/api/tickets/stats/route.ts
import { connectDB } from '@/lib/db';
import { fetchStats } from '@/controllers/ticketController';
import { NextResponse } from 'next/server';

export async function GET() {
  await connectDB();
  const stats = await fetchStats();
  return NextResponse.json(stats);
}