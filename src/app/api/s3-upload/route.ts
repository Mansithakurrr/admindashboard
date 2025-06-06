// app/api/s3-upload/route.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const s3 = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

function generateFileName(originalName: string) {
    const ext = originalName.split(".").pop();
    return `${crypto.randomUUID()}.${ext}`;
}

export async function POST(req: NextRequest) {
    const { filename, fileType } = await req.json();

    const key = `tickets/${generateFileName(filename)}`;
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
        ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${key}`;

    return NextResponse.json({
        signedUrl,
        publicUrl,
        key,
    });
}
