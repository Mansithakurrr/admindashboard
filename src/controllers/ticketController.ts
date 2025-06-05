// src/controllers/ticketController.ts
import {
  createTicket, // This will now handle serial number generation internally
  getTicketStats,
  getTickets,
  getTicketById,
  updateTicketById,
  deleteTicketById,
} from '@/services/ticketService'; // Correct path to your service

import mongoose from 'mongoose';

export async function fetchStats() {
  return await getTicketStats();
}

export async function fetchTickets(params: URLSearchParams) {
  const page = parseInt(params.get('page') || '1');
  const limit = parseInt(params.get('limit') || '10');
  const status = params.get('status');
  const search = params.get('search');

  const query: any = {};
  if (status) query.status = status;
  if (search) query.subject = { $regex: search, $options: 'i' };

  return await getTickets(query, page, limit);
}


export async function fetchTicket(id: string) {
  return await getTicketById(id);
}

export async function patchTicket(id: string, updates: any) {
  return await updateTicketById(id, updates);
}

export async function removeTicket(id: string) {
  return await deleteTicketById(id);
}

// MODIFIED postTicket function
export async function postTicket(data: any) { // 'data' is from the API route (parsed form data)
  console.log("CONTROLLER: postTicket called with data:", data);
  // The createTicket service function will now handle serialNumber generation
  return await createTicket(data); 
}
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