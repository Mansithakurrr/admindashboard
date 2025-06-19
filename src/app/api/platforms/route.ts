// src/app/api/organizations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import Platform from '@/models/Platform';

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const platforms = await Platform.find({}, '_id name').lean();
    console.log(platforms, "-----------------platformsplatformsplatforms");
    return NextResponse.json(platforms);
  } catch (error) {
    console.error("Error fetching platforms:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}