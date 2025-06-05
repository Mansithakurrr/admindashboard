// src/app/api/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";
import { postTicket, fetchTickets } from '@/controllers/ticketController';
import {uploadToS3} from '@/services/s3Service';

// GET function can remain as is, if you have one for fetchTickets
export async function GET(req: NextRequest) {
    try {
      await connectDB();
      const url = new URL(req.url);
      console.log(url,"-----------------url")
      const result: any = await fetchTickets(url.searchParams); 
      return NextResponse.json(result);
    } catch (error: any) {
      console.error("GET /api/tickets error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }
  


export async function POST(req: NextRequest) {
    console.log("API hit");

    try {
        await connectDB();
        const formData = await req.formData();

         // Upload files to S3
         const files = formData.getAll("attachment") as File[];
         const uploadedUrls = [];
    
        for (const file of files) {
            if (file && file.size > 0) {
              const url = await uploadToS3(file);
              console.log(url,"-----------------url")
              uploadedUrls.push(url);
            }
          }

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
            attachments: uploadedUrls,
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