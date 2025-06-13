// src/app/api/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";
import { fetchTickets, createTicketHandler } from '@/controllers/ticketController';

export async function GET(req: NextRequest) {
    try {
      await connectDB();
      const url = new URL(req.url);
      const result: any = await fetchTickets(url.searchParams); 
      return NextResponse.json(result);
    } catch (error: any) {
      console.error("GET /api/tickets error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }
  

  export async function POST(req: NextRequest) {
    return createTicketHandler(req);
  }