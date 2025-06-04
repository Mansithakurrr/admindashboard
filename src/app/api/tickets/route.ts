// src/app/api/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";
import { postTicket, fetchTickets } from '@/controllers/ticketController';

// GET function can remain as is, if you have one for fetchTickets
export async function GET(req: NextRequest) {
    await connectDB();
    const url = new URL(req.url);
    const result = await fetchTickets(url.searchParams); 
    return NextResponse.json(result);
}


export async function POST(req: NextRequest) {
    console.log("API ROUTE: POST /api/tickets hit");
    try {
        await connectDB();
        const formData = await req.formData();

        const ticketDataFromForm = {
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
            priority: formData.get('priority') || undefined,
            type: formData.get('type'),
            activityLog: [
                {
                    id: Date.now().toString(),
                    timestamp: new Date(),
                    user: formData.get('email'),
                    action: 'Ticket Created',
                    from: '',
                    to: 'Open',
                    details: 'Initial submission via dashboard form.',
                },
            ],
        };
        
        console.log("API ROUTE: Data extracted from form:", ticketDataFromForm);

        const newTicket = await postTicket(ticketDataFromForm);

        console.log("API ROUTE: Ticket successfully created by controller/service:", newTicket);
        return NextResponse.json({ success: true, ticket: newTicket }, { status: 201 });

    } catch (err: any) {
        console.error("API ROUTE: Error creating ticket:", err.message, err.stack);
        return NextResponse.json({ success: false, message: err.message || "Internal server error" }, { status: 500 });
    }
}