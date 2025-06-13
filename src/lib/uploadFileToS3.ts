// lib/uploadFileToS3.ts
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFileToS3(filename: string, buffer: Buffer, contentType: string) {
  const key = `tickets/${randomUUID()}-${filename}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: "public-read", // ensures file is publicly accessible
    })
  );

  return {
    publicUrl: `https://${process.env.AWS_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${key}`,
    key,
  };
}
