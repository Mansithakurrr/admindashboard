// app/api/tickets/[id]/route.ts
import Ticket from '@/models/Ticket'; // Your Mongoose Ticket model
import { connectDB } from "@/lib/db";
import {
  fetchTicket,
  patchTicketHandler,
  removeTicket,
} from "@/controllers/ticketController";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: any }
) {
  await connectDB();
  try {
    const ticket = await fetchTicket(params.id);
    console.log("Ticket fetched:", ticket);
    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }
    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error in GET /api/tickets/[id]:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   await connectDB();
//   return patchTicketHandler(req, params.id);
// }



// export async function GET(req: NextRequest, { params }: { params: { ticketId: string } }) {
//     await connectDB();
//     const { ticketId } = params;

//     try {
//         const ticket = await Ticket.findById(ticketId);
//         if (!ticket) {
//             return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
//         }
//         return NextResponse.json(ticket);
//     } catch (error: any) {
//         console.error("API Error fetching ticket by ID:", error);
//         return NextResponse.json({ message: "Failed to fetch ticket", error: error.message }, { status: 500 });
//     }
// }

export async function PATCH(
  req: NextRequest,
  context: { params: any }
) {
  await connectDB();
  const { id } = await context.params;
  return patchTicketHandler(req, id);
}


export async function DELETE(
  _: NextRequest,
  { params }: { params: any }
) {
  await connectDB();
  const deleted = await removeTicket( await params.id);
  if (!deleted) {
    return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "Ticket deleted successfully" });
}
