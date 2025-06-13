// src/app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";
import Comment from '@/models/Comment'; // Your Mongoose Comment model
import Ticket from '@/models/Ticket';   // Your Mongoose Ticket model

// Your GET function can remain as is.
export async function GET(req: NextRequest) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");
    if (!ticketId) {
        return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
    }
    const comments = await Comment.find({ ticketId }).sort({ createdAt: 1 });
    return NextResponse.json(comments);
}


// === THIS IS THE CORRECTED POST FUNCTION ===
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { ticketId, text, author } = await req.json();

        if (!ticketId || !text || !author) {
            return NextResponse.json({ error: "Missing required fields: ticketId, text, author" }, { status: 400 });
        }

        // Step 1: Create and save the new comment document
        const newComment = new Comment({
            ticketId,
            text,
            author,
        });
        await newComment.save();
        console.log("API: New comment saved successfully:", newComment);

        // Step 2: Create the activity log entry object for the parent ticket
        const activityLogEntry = {
          id: newComment._id.toString(), // Use the new comment's ID for the log's ID
          timestamp: newComment.createdAt,
          user: author,
          action: "Comment Added",
          details: text, // The comment text is the detail
        };

        // Step 3: Find the parent ticket and push the new activity to its log
        const updatedTicket = await Ticket.findByIdAndUpdate(
          ticketId,
          { 
            $push: { 
              activityLog: { 
                $each: [activityLogEntry], 
                $position: 0 // Adds the new activity to the start of the array
              } 
            } 
          },
          { new: true } // This option returns the updated document
        );

        if (!updatedTicket) {
          // This case is unlikely if the comment was just added to a valid ticket
          return NextResponse.json({ message: "Parent ticket not found after adding comment" }, { status: 404 });
        }
    
        console.log("API: Parent ticket's activity log updated successfully.");
        
        // Step 4: Return the FULLY updated ticket object
        // The frontend (TicketViewClient.tsx) needs this to refresh its state.
        return NextResponse.json(updatedTicket, { status: 201 });

    } catch (error: any) {
        console.error("API Error adding comment:", error);
        return NextResponse.json({ message: "Failed to add comment", error: error.message }, { status: 500 });
    }
}
