import { NextResponse } from "next/server";
import Organization from "@/models/Organization";
import { connectDB } from "@/lib/db";

export async function GET() {
  try {
    await connectDB(); // ensure DB is connected
    const organizations = await Organization.find({});
    console.log(organizations, "-----------------organizationsorganizationsorganizations");
    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch organizations." }, { status: 500 });
  }
}
