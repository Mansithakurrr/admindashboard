// lib/serialNumber.ts
import Counter from "@/models/Counter";
import { connectDB } from "@/lib/db";

export async function getNextTicketSerial(): Promise<string> {
  await connectDB();

  const counter = await Counter.findOneAndUpdate(
    { _id: "ticketNumber" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const ticketNumber = `TKT-${String(counter.seq).padStart(3, '0')}`;
  return ticketNumber;
}
