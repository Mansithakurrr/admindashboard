// src/app/api/tickets/[id]/remarks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { patchResolvedRemarks } from "@/controllers/ticketController";

export async function PATCH(req: NextRequest, { params }: any) {
  try {
    await connectDB();
    const { remarks } = await req.json();

    if (!remarks) {
      return NextResponse.json({ error: "Remarks are required." }, { status: 400 });
    }

    const updatedTicket = await patchResolvedRemarks(params.id, remarks);

    if (!updatedTicket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    return NextResponse.json(updatedTicket, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update remarks." }, { status: 500 });
  }
}
