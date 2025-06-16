// src/app/api/tickets/[id]/remarks/route.ts
// import { patchResolvedRemarks } from "@/controllers/ticketController";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { updateTicketById } from "@/services/ticketService";

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } } // ✅ Valid context type
) {
  try {
    await connectDB();

    const { remarks } = await req.json();

    if (!remarks) {
      return NextResponse.json({ error: "Remarks are required." }, { status: 400 });
    }

    const updatedTicket = await updateTicketById(context.params.id, {
      resolvedRemarks: remarks,
    });

    if (!updatedTicket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    return NextResponse.json(updatedTicket, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update remarks." }, { status: 500 });
  }
}




// export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     await connectDB();
//     const { remarks } = await req.json();

//     if (!remarks) {
//       return NextResponse.json({ error: "Remarks are required." }, { status: 400 });
//     }

//     const updatedTicket = await patchResolvedRemarks(params.id, remarks);

//     if (!updatedTicket) {
//       return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
//     }

//     return NextResponse.json(updatedTicket, { status: 200 });
//   } catch (error: any) {
//     console.error(error);
//     return NextResponse.json({ error: "Failed to update remarks." }, { status: 500 });
//   }
// }
