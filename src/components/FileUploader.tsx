'use client';

import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import toast from 'react-hot-toast';

type UploadedFile = {
  originalName: string;
  type: string;
  url: string;
};

interface FileUploaderProps {
  onUpload: (files: UploadedFile[]) => void;
}

const MAX_FILES = 5;

export default function FileUploader({ onUpload }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = async (acceptedFiles: File[]) => {
    const totalAfterUpload = uploadedFiles.length + acceptedFiles.length;
    if (totalAfterUpload > MAX_FILES) {
      toast.error(`You can only upload up to ${MAX_FILES} files.`);
      return;
    }

    setUploading(true);
    const results: UploadedFile[] = [];

    for (const file of acceptedFiles) {
      try {
        const res = await fetch('/api/s3-upload', {
          method: 'POST',
          body: JSON.stringify({
            filename: file.name,
            fileType: file.type,
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        const { signedUrl, publicUrl } = await res.json();

        await fetch(signedUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type },
        });

        results.push({
          url: publicUrl,
          originalName: file.name,
          type: file.type,
        });
      } catch (error) {
        console.error('Upload error:', error);
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    const updatedFiles = [...uploadedFiles, ...results];
    setUploadedFiles(updatedFiles);
    onUpload(updatedFiles);
    setUploading(false);
  };

  const handleRemoveFile = (url: string) => {
    const updated = uploadedFiles.filter((file) => file.url !== url);
    setUploadedFiles(updated);
    onUpload(updated);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'application/msword': [],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
      'application/zip': [],
    },
  });

  return (
    <>
      <label className="block mb-1 font-medium">
        Attachments
      </label>
      <div className="p-4 border-2 border-dashed rounded-xl text-center cursor-pointer bg-gray-50" {...getRootProps()}>
        <input {...getInputProps()} />
        {uploading ? (
          <p className="text-blue-500">Uploading files...</p>
        ) : (
          <p className="text-gray-600">
            Drag & drop files here, or click to browse (Max {MAX_FILES})
          </p>
        )}

        {uploadedFiles.length > 0 && (
          <ul className="mt-4 text-left text-sm space-y-1">
            {uploadedFiles.map((file) => (
              <li key={file.url} className="flex justify-between items-center border rounded px-2 py-1 bg-white">
                <span className="truncate max-w-[220px]">✅ {file.originalName}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.url)}
                  className="text-red-500 hover:underline text-xs ml-2"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
