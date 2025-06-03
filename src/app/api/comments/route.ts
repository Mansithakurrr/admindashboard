// app/api/comments/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";

// GET /api/comments?ticketId=...
export async function GET(req: Request) {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
        return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
    }

    const comments = await Comment.find({ ticketId }).sort({ createdAt: 1 });
    return NextResponse.json(comments);
}



// POST /api/comments
export async function POST(req: Request) {
    try {
        await connectDB();
        const { text, author, ticketId } = await req.json();

        if (!text || !author || !ticketId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const newComment = await Comment.create({ text, author, ticketId });
        return NextResponse.json(newComment, { status: 201 });
    } catch (error) {
        console.error("Error in POST /api/comments:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
