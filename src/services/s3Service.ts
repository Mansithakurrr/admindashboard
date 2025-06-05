// src/services/s3Service.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: process.env.AWS_S3_ENDPOINT,
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME!;

export async function uploadToS3(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop();
  const key = `tickets/${randomUUID()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  await s3.send(command);

  return `https://${BUCKET}.amazonaws.com/${key}`;
}
