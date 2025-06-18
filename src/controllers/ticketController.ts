// src/controllers/ticketController.ts
import {
  createTicket,
  getTicketStats,
  getTickets,
  getTicketById,
  updateTicketById,
  deleteTicketById,
  // patchTicket,
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
    console.log(form), "===========form"
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

export async function fetchTicket(id: string) {
  return await getTicketById(id);
}

export async function patchTicketHandler(req: NextRequest, id: string) {
  try {
    const updates = await req.json();
    const updatedTicket = await updateTicketById(id, updates);

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


const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

const TicketCounter = mongoose.models.TicketCounter || mongoose.model('TicketCounter', CounterSchema);

async function getNextSequenceValue(sequenceName: string): Promise<number> {
  const counter = await TicketCounter.findByIdAndUpdate(
    sequenceName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  if (!counter) {
    throw new Error("Could not find or initialize counter for sequence: " + sequenceName);
  }
  return counter.seq;
}

export async function patchResolvedRemarks(id: string, remarks: string) {
  return await updateResolvedRemarks(id, remarks);
}
