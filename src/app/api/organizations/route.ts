// src/app/api/organizations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Organization from '@/models/Organization';

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const organizations = await Organization.find({}, '_id name').lean(); // Fetch _id and name
    console.log(organizations, "-----------------organizationsorganizationsorganizations");
    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}