// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleImageUpload } from "@/controllers/uploadController";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageUrl = await handleImageUpload(formData);

    return NextResponse.json({ success: true, imageUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
