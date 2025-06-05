// src/controllers/uploadController.ts
import { uploadToS3 } from "@/services/s3Service";
import { Readable } from "stream";

export async function handleImageUpload(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) {
    throw new Error("No file uploaded");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileUrl = await uploadToS3(file);
  return fileUrl;
}
