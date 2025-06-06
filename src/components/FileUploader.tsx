'use client';

import { useDropzone } from 'react-dropzone';
import { useState } from 'react';

type UploadedFile = {
  name: string;
  type: string;
  url: string; // public URL to store in DB
};

export default function FileUploader({ onUpload }: { onUpload: (files: UploadedFile[]) => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = async (acceptedFiles: File[]) => {
    setUploading(true);
    const results: UploadedFile[] = [];

    for (const file of acceptedFiles) {
      try {
        // Step 1: Get signed URL and public URL from backend
        const res = await fetch('/api/s3-upload', {
          method: 'POST',
          body: JSON.stringify({
            filename: file.name,
            fileType: file.type,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        const { signedUrl, publicUrl } = await res.json();

        // Step 2: Upload file to S3 using the signed URL
        await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        results.push({
          name: file.name,
          type: file.type,
          url: publicUrl,
        });
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    setUploadedFiles((prev) => [...prev, ...results]);
    onUpload([...uploadedFiles, ...results]); // Notify parent form
    setUploading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="p-4 border-2 border-dashed rounded-xl text-center cursor-pointer" {...getRootProps()}>
      <input {...getInputProps()} />
      {uploading ? 'Uploading files...' : 'Drag & drop files here, or click to browse'}
      {uploadedFiles.length > 0 && (
        <ul className="mt-4 text-left text-sm">
          {uploadedFiles.map((file) => (
            <li key={file.url}>✅ {file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
