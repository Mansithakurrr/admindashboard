// src/controllers/ticketController.ts
import {
  createTicket, // This will now handle serial number generation internally
  getTicketStats,
  getTickets,
  getTicketById,
  updateTicketById,
  deleteTicketById,
  patchTicket,
} from '@/services/ticketService'; // Correct path to your service
import { updateResolvedRemarks } from "@/services/ticketService";
import { Ticket } from 'lucide-react';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { uploadFileToS3 } from "@/lib/uploadFileToS3";

export async function fetchStats() {
  return await getTicketStats();
}


export async function createTicketHandler(req: NextRequest) {
  await connectDB();

  try {
    const form = await req.formData();
console.log(form),"===========form"
    const name = form.get("name")?.toString() || "";
    const email = form.get("email")?.toString() || "";
    const contactNumber = form.get("contactNumber")?.toString() || "";
    const title = form.get("title")?.toString() || "";
    const description = form.get("description")?.toString() || "";
    const category = form.get("category")?.toString() || "";
    const priority = form.get("priority")?.toString() || "low";
    const platform = form.get("platform")?.toString() || "";
    const organization = form.get("organization")?.toString() || "";
    const type = form.get("type")?.toString() || "Support";

    let attachments = [];
    try {
      const raw = form.get("attachments")?.toString() || "[]";
      const parsed = JSON.parse(raw);
      attachments = parsed.map((item: any) => {
        if (typeof item === "string") {
          return { url: item, originalName: "unknown" };
        }
        return {
          url: item.url,
          originalName: item.originalName || "unknown",
        };
      });
    } catch (err) {
      console.warn("Failed to parse attachments", err);
    }

    console.log("🔔 Incoming Ticket Submission:");
    console.log({
      name,
      email,
      contactNumber,
      title,
      description,
      category,
      priority,
      platform,
      organization,
      type,
      attachments,
    });
    // Validate basic required fields
    if (!name || !email || !title || !description || !category || !platform || !organization) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const ticket = await createTicket({
      name,
      email,
      contactNumber,
      subject: {
        title,
        description,
      },
      category,
      priority,
      platform,
      organization,
      attachments,
      type,
    });
    const plainTicket = JSON.parse(JSON.stringify(ticket));
    return NextResponse.json({ success: true, ticket: plainTicket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Ticket creation failed." },
      { status: 400 }
    );
  }
}


export async function fetchTickets(params: URLSearchParams) {
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '10');
  const status = params.get('status');
  const search = params.get('search');

  const query: any = {};
  if (status) query.status = status;
  if (search) query.title = { $regex: search, $options: 'i' };

  return await getTickets(query, page, limit);
}

// export async function createTicketHandler(req: NextRequest) {
//   try {
//     const body = await req.json();

//     // Call service to create ticket
//     const ticket = await createTicket(body);

//     return NextResponse.json({ success: true, ticket }, { status: 201 });
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, message: error.message || "Failed to create ticket" },
//       { status: 400 }
//     );
//   }
// }


export async function fetchTicket(id: string) {
  return await getTicketById(id);
}

// export async function patchTicket(id: string, updates: any) {
//   return await updateTicketById(id, updates);
// }

export async function patchTicketHandler(req: NextRequest, id: string) {
  try {
    const updates = await req.json();
    const updatedTicket = await patchTicket(id, updates);

    if (!updatedTicket) {
      return NextResponse.json({ message: "Ticket not found or invalid ID" }, { status: 404 });
    }

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("PATCH /api/tickets/[id] error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function removeTicket(id: string) {
  return await deleteTicketById(id);
}

// MODIFIED postTicket function
// export async function postTicket(data: any) { // 'data' is from the API route (parsed form data)
//   console.log("CONTROLLER: postTicket called with data:", data);

//   // 🔍 Convert platform name to ObjectId
//   const platform = await Platform.findOne({ name: new RegExp(`^${data.platformName}$`, 'i') });
//   if (!platform) throw new Error("Invalid platform name");

//   const organization = await Organization.findOne({ name: new RegExp(`^${data.orgName}$`, 'i') });
//   if (!organization) throw new Error("Invalid organization name");

//   const ticketData = {
//     ...data,
//     platformId: platform._id,
//     orgId: organization._id,
//     category: data.category.toLowerCase(),
//   };

//   // The createTicket service function will now handle serialNumber generation
//   return await createTicket(ticketData);
// }

const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

// Use a unique name for the model to avoid conflicts if 'Counter' is used elsewhere
const TicketCounter = mongoose.models.TicketCounter || mongoose.model('TicketCounter', CounterSchema);

async function getNextSequenceValue(sequenceName: string): Promise<number> {
  const counter = await TicketCounter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // new: true returns the document AFTER update, upsert: true creates it
  );
  if (!counter) {
    // This should be extremely rare with upsert: true
    // Consider initializing the counter document in MongoDB directly if this becomes an issue
    // For example, db.counters.insertOne({ _id: "ticketSerialNumber", seq: 0 })
    throw new Error("Could not find or initialize counter for sequence: " + sequenceName);
  }
  return counter.seq;
}
// --- End of Serial Number Generation Logic ---




export async function patchResolvedRemarks(id: string, remarks: string) {
  return await updateResolvedRemarks(id, remarks);
}
