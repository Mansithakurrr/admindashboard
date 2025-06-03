// src/app/api/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";
// Remove direct Ticket model import if controller handles creation
// import Ticket from '@/models/Ticket'; 
// Remove uuidv4 import as serial numbers will be sequential
// import { v4 as uuidv4 } from 'uuid'; 
import { postTicket, fetchTickets } from '@/controllers/ticketController'; // Ensure postTicket is imported

// GET function can remain as is, if you have one for fetchTickets
export async function GET(req: NextRequest) {
    await connectDB();
    const url = new URL(req.url);
    // Assuming fetchTickets is defined in your controller
    const result = await fetchTickets(url.searchParams); 
    return NextResponse.json(result);
}


export async function POST(req: NextRequest) {
    console.log("API ROUTE: POST /api/tickets hit");
    try {
        await connectDB();
        const formData = await req.formData();

        // Construct the ticket data object from formData
        // Match the fields your Mongoose schema expects (excluding serialNumber, _id, createdAt, updatedAt)
        const ticketDataFromForm = {
            name: formData.get('name'),
            email: formData.get('email'),
            contactNumber: formData.get('contactNumber'),
            platformName: formData.get('platform'), // Match frontend form field name
            Organization: formData.get('organization'), // Match frontend form field name
            subject: {
                title: formData.get('subject'),       // Match frontend form field name
                description: formData.get('description'), // Match frontend form field name
            },
            category: formData.get('category'),
            // priority is defaulted in schema if not provided
            priority: formData.get('priority') || undefined, // Send undefined if not present, schema default will apply
            type: formData.get('type'),
            // 'days' field is commented out in your schema. 
            // If you need it, ensure the form sends it or set a default.
            // For now, we'll omit it so it doesn't send NaN if form field is missing.
            // days: formData.get('days') ? parseInt(formData.get('days') as string, 10) : undefined,
            
            // Initial activity log entry - this is good
            activityLog: [
                {
                    id: Date.now().toString(), // Or use uuidv4 if you prefer for log entry IDs
                    timestamp: new Date(), // Mongoose schema will use default, but this is fine
                    user: formData.get('email'), // Or the name
                    action: 'Ticket Created',
                    from: '',
                    to: 'Open', // Or whatever your initial status is
                    details: 'Initial submission via dashboard form.',
                },
            ],
        };
        
        console.log("API ROUTE: Data extracted from form:", ticketDataFromForm);

        // Call the controller function, which will handle serialNumber generation via the service
        const newTicket = await postTicket(ticketDataFromForm);

        console.log("API ROUTE: Ticket successfully created by controller/service:", newTicket);
        return NextResponse.json({ success: true, ticket: newTicket }, { status: 201 });

    } catch (err: any) {
        console.error("API ROUTE: Error creating ticket:", err.message, err.stack);
        return NextResponse.json({ success: false, message: err.message || "Internal server error" }, { status: 500 });
    }
}