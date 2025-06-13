import { NextResponse } from "next/server";
import Platform from "@/models/Platform";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB(); // ensure DB is connected
    const platforms = await Platform.find({});
    console.log(platforms, "-----------------platformsplatformsplatforms");
    return NextResponse.json(platforms);
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch platforms." }, { status: 500 });
  }
}
