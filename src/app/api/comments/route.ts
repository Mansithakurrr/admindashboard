// src/app/api/comments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from "@/lib/db";
import Comment from '@/models/Comment';
import Ticket from '@/models/Ticket';

export async function GET(req: NextRequest) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");
    if (!ticketId) {
        return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
    }
    const comments = await Comment.find({ ticketId }).sort({ createdAt: -1 });
    return NextResponse.json(comments);
}


export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { ticketId, text, author } = await req.json();

        if (!ticketId || !text || !author) {
            return NextResponse.json({ error: "Missing required fields: ticketId, text, author" }, { status: 400 });
        }

        const newComment = new Comment({
            ticketId,
            text,
            author,
        });
        await newComment.save();
        console.log("API: New comment saved successfully:", newComment);

        const activityLogEntry = {
          id: newComment._id.toString(),
          timestamp: newComment.createdAt,
          user: author,
          action: "Comment Added",
          details: text,
        };

        const updatedTicket = await Ticket.findByIdAndUpdate(
          ticketId,
          { 
            $push: { 
              activityLog: { 
                $each: [activityLogEntry], 
                $position: 0 
              } 
            } 
          },
          { new: true } 
        );

        if (!updatedTicket) {
          return NextResponse.json({ message: "Parent ticket not found after adding comment" }, { status: 404 });
        }
    
        console.log("API: Parent ticket's activity log updated successfully.");
        
        return NextResponse.json(updatedTicket, { status: 201 });

    } catch (error: any) {
        console.error("API Error adding comment:", error);
        return NextResponse.json({ message: "Failed to add comment", error: error.message }, { status: 500 });
    }
}
