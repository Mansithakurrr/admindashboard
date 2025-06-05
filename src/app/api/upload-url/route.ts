// src/app/api/upload-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileType = searchParams.get("fileType");

  if (!fileType) {
    return NextResponse.json({ error: "Missing fileType" }, { status: 400 });
  }

  const key = `tickets/${randomUUID()}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: fileType,
  });

  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

  return NextResponse.json({
    key,
    signedUrl,
    url: `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  });
}
