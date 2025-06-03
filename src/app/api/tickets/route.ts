
// app/api/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";
import Ticket from '@/models/Ticket';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        const newTicket = new Ticket({
            serialNumber: uuidv4(),
            id: uuidv4(),
            name: formData.get('name'),
            email: formData.get('email'),
            contactNumber: formData.get('contactNumber'),
            platformName: formData.get('platform'),
            Organization: formData.get('organization'),
            subject: {
                title: formData.get('subject'),
                description: formData.get('description'),
            },
            category: formData.get('category'),
            priority: formData.get('priority') || 'medium',
            type: formData.get('type'),
            days: parseInt(formData.get('days') as string, 10),
            activityLog: [
                {
                    id: uuidv4(),
                    timestamp: new Date(),
                    user: formData.get('email'),
                    action: 'Ticket Created',
                    from: '',
                    to: 'Open',
                    details: 'Initial submission',
                },
            ],
        });

        await newTicket.save();

        return NextResponse.json({ success: true, ticket: newTicket });
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 500 });
    }
}



// export async function GET() {
//   try {
//     await connectDB(); // ensure DB is connected
//     const tickets = await Ticket.find({});
//     return NextResponse.json({ tickets });
//   } catch (error) {
//     console.error("API /api/tickets error:", error);
//     return NextResponse.json({ message: "Failed to fetch tickets" }, { status: 500 });
//   }
// }



export async function GET(req: NextRequest) {
    try {
      await connectDB();
  
      const { searchParams } = new URL(req.url);
  
      const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
      const limit = Math.min(100, parseInt(searchParams.get('limit') || '10', 10)); // max 100 per page
      const skip = (page - 1) * limit;
  
      const [tickets, total] = await Promise.all([
        Ticket.find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Ticket.countDocuments()
      ]);
  
      const hasMore = skip + tickets.length < total;
      const totalPages = Math.ceil(total / limit);
  
      return NextResponse.json({ tickets, hasMore, total, totalPages, page });
    } catch (error) {
      console.error("API /api/tickets error:", error);
      return NextResponse.json({ message: "Failed to fetch tickets" }, { status: 500 });
    }
  }
  