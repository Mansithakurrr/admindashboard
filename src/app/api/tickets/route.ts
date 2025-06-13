// src/app/api/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";
import { fetchTickets, createTicketHandler } from '@/controllers/ticketController';

// GET function can remain as is, if you have one for fetchTickets
export async function GET(req: NextRequest) {
    try {
      await connectDB();
      const url = new URL(req.url);
      const result: any = await fetchTickets(url.searchParams); 
      return NextResponse.json(result);
    } catch (error: any) {
      console.error("GET /api/tickets error:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  }
  

  export async function POST(req: NextRequest) {
    return createTicketHandler(req);
  }
  
  // export async function POST(req: NextRequest) {
  //   await connectDB();
  
  //   try {
  //     const body = await req.json();
  
  //     const ticketData = {
  //       name: body.name,
  //       email: body.email,
  //       contactNumber: body.contactNumber,
  //       platformName: body.platform,
  //       orgName: body.organization,
  //       category: body.category,
  //       priority: body.priority,
  //       type: body.type,
  //       subject: {
  //         title: body.subject,
  //         description: body.description,
  //       },
  //       attachments: body.attachments || [],
  //       activityLog: [
  //         {
  //           id: Date.now().toString(),
  //           timestamp: new Date(),
  //           user: body.email,
  //           action: "Ticket Created",
  //           from: "",
  //           to: "New",
  //           details: "Initial submission via support form.",
  //         },
  //       ],
  //     };
  
  //     const result = await postTicket(ticketData);
  
  //     return NextResponse.json({ success: true, ticket: result }, { status: 201 });
  //   } catch (err: any) {
  //     console.error("Error creating ticket:", err);
  //     return NextResponse.json(
  //       { success: false, message: "Error creating ticket: " + err.message },
  //       { status: 500 }
  //     );
  //   }
  // }
  
  

  // export async function POST(req: NextRequest) {
  //   await connectDB();
  
  //   try {
  //     const formData = await req.formData();
  
  //     const attachments = formData.getAll("attachments") as File[];
  //     const uploadedUrls = [];
  
  //     for (const file of attachments) {
  //       if (file && typeof file === "object" && file.size > 0) {
  //         const url = await uploadToS3(file); 
  //         uploadedUrls.push({
  //           url,
  //           name: file.name,
  //           type: file.type,
  //         });
  //       }
  //     }
  
  //     const ticketData = {
  //       name: formData.get("name"),
  //       email: formData.get("email"),
  //       contactNumber: formData.get("contactNumber"),
  //       platformName: formData.get("platform"),
  //       Organization: formData.get("organization"),
  //       category: formData.get("category"),
  //       priority: formData.get("priority"),
  //       type: formData.get("type"),
  //       subject: {
  //         title: formData.get("subject"),
  //         description: formData.get("description"),
  //       },
  //       attachments: uploadedUrls,
  //       activityLog: [
  //         {
  //           id: Date.now().toString(),
  //           timestamp: new Date(),
  //           user: formData.get("email"),
  //           action: "Ticket Created",
  //           from: "",
  //           to: "New",
  //           details: "Initial submission via support form.",
  //         },
  //       ],
  //     };
  
  //     const result = await postTicket(ticketData);
  
  //     return NextResponse.json({ success: true, ticket: result }, { status: 201 });
  
  //   } catch (err: any) {
  //     console.error("Error creating ticket:", err);
  //     return NextResponse.json(
  //       { success: false, message: "Error creating ticket: " + err.message },
  //       { status: 500 }
  //     );
  //   }
  // }
  


// export async function POST(req: NextRequest) {
//     console.log("API hit");

//     try {
//         await connectDB();
//         const formData = await req.formData();

//          // Upload files to S3
//          const files = formData.getAll("attachments") as File[];
//          const uploadedUrls = [];
    
//         for (const file of files) {
//             if (file && file.size > 0) {
//               const url = await uploadToS3(file);
//               console.log(url,"-----------------url")
//               uploadedUrls.push(url);
//             }
//           }

//         const ticketDataFromForm = {
//             name: formData.get('name'),
//             email: formData.get('email'),
//             contactNumber: formData.get('contactNumber'),
//             platformName: formData.get('platform'),
//             Organization: formData.get('organization'),
//             subject: {
//                 title: formData.get('subject'),
//                 description: formData.get('description'),
//             },
//             category: formData.get('category'),
//             priority: formData.get('priority') || undefined,
//             type: formData.get('type'),
//             attachments: uploadedUrls,
//             activityLog: [
//                 {
//                     id: Date.now().toString(),
//                     timestamp: new Date(),
//                     user: formData.get('email'),
//                     action: 'Ticket Created',
//                     from: '',
//                     to: 'New',
//                     details: 'Initial submission via dashboard form.',
//                 },
//             ],
//         };
        
//         console.log("API ROUTE: Data extracted from form:", ticketDataFromForm);

//         const newTicket = await postTicket(ticketDataFromForm);

//         console.log("API ROUTE: Ticket successfully created by controller/service:", newTicket);
//         return NextResponse.json({ success: true, ticket: newTicket }, { status: 201 });

//     } catch (err: any) {
//         console.error("API ROUTE: Error creating ticket:", err.message, err.stack);
//         return NextResponse.json({ success: false, message: err.message || "Internal server error" }, { status: 500 });
//     }
// }