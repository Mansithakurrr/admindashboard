'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useRouter } from 'next/navigation';

type TicketConfirmation = {
  serialNumber: string;
  createdAt: string;
  status: string;
};

export default function UserTicketForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get('name') || '';
  const email = searchParams.get('email') || '';
  const platform = searchParams.get('platformId') || '';
  const organization = searchParams.get('orgId') || '';
  const category = searchParams.get('category') || 'others';

  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<TicketConfirmation | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(f => f.size <= 10 * 1024 * 1024);
    if (validFiles.length + files.length > 5) {
      setError("You can upload up to 5 files only.");
      return;
    }
    setFiles(prev => [...prev, ...validFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 10 * 1024 * 1024,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc', '.docx'],
      'text/plain': ['.txt'],
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    if (!formData.get("title") || !formData.get("platform") || !formData.get("organization")) {
      setError("Please fill in all required fields.");
      setSubmitting(false);
      return;
    }

    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const uploadRes = await fetch('/api/s3-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            fileType: file.type,
          }),
        });

        if (!uploadRes.ok) throw new Error('Error uploading to S3');

        const { signedUrl, publicUrl } = await uploadRes.json();

        await fetch(signedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file,
        });

        uploadedUrls.push(publicUrl);
      }

      formData.append('attachments', JSON.stringify(uploadedUrls));

      const res = await fetch('/api/tickets', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to submit ticket');

      setConfirmation({
        serialNumber: data.ticket.serialNumber,
        createdAt: data.ticket.createdAt,
        status: data.ticket.status,
      });

      e.currentTarget.reset();
      setFiles([]);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  if (confirmation) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-xl mx-auto mt-12 border border-green-300">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-3">
            ✅ Ticket Submitted!
          </h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold text-gray-800">
              Ticket No #{confirmation.serialNumber}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Submitted on: {formatDate(confirmation.createdAt)}
            </p>
            <p className="text-sm text-gray-600">
              Status: <strong>{confirmation.status}</strong>
            </p>
          </div>
          <button
      className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      onClick={() => {
        setConfirmation(null);
        router.push('/dashboard');
      }}
    >
      Close
    </button>

          {/* <button
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setConfirmation(null)}
          >
            Close
          </button> */}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-lg space-y-6 border border-gray-200"
    >
      <h2 className="text-xl font-semibold text-center text-gray-800">
        Submit a Ticket
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div>
          <label className="text-sm font-medium">Name</label>
          <input
            name="name"
            value={name}
            readOnly
            className="w-full mt-1 px-3 py-2 border rounded bg-gray-100 text-sm"
          />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={email}
            readOnly
            className="w-full mt-1 px-3 py-2 border rounded bg-gray-100 text-sm"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium">Mobile Number</label>
          <input
            name="contactNumber"
            pattern="[0-9]*"
            inputMode="numeric"
            placeholder="Enter phone number"
            className="w-full mt-1 px-3 py-2 border rounded text-sm"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            defaultValue={category}
            required
            className="w-full mt-1 px-3 py-2 border rounded text-sm"
          >
            <option value="" disabled>Select category</option>
            <option value="bugs">Bugs</option>
            <option value="Tech support">Tech Support</option>
            <option value="new feature">New Feature</option>
            <option value="others">Others</option>
          </select>
        </div>

        {/* Subject */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium">
            Subject <span className="text-red-500">*</span>
          </label>
          <input
            name="title" // updated from "subject"
            required
            maxLength={50}
            placeholder="Issue title"
            className="w-full mt-1 px-3 py-2 border rounded text-sm"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={3}
            maxLength={500}
            placeholder="Describe your issue"
            className="w-full mt-1 px-3 py-2 border rounded text-sm"
          />
        </div>

        {/* Attachments */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Attachments</label>
          <div
            {...getRootProps()}
            className={`w-full mt-1 p-4 border-2 border-dashed rounded cursor-pointer text-center ${
              isDragActive ? 'bg-blue-50 border-blue-400' : 'border-gray-300'
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-sm text-gray-600">
              {isDragActive
                ? 'Drop files here...'
                : 'Drag and drop or click to select files'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max 5 files, 10MB each
            </p>
          </div>

          {files.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm">
              {files.map((file, i) => {
                const isImage = file.type.startsWith("image/");
                const previewUrl = isImage ? URL.createObjectURL(file) : null;

                return (
                  <li key={i} className="flex items-center justify-between gap-4 border p-2 rounded">
                    <div className="flex items-center gap-3">
                      {isImage ? (
                        <img
                          src={previewUrl!}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded border"
                        />
                      ) : (
                        <div className="w-12 h-12 flex items-center justify-center bg-gray-100 border rounded text-xs text-gray-600">
                          📄
                        </div>
                      )}
                      <span className="truncate max-w-[180px]">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Hidden Fields */}
      <input type="hidden" name="platform" value={platform} />
      <input type="hidden" name="organization" value={organization} />
      <input type="hidden" name="type" value="Support" />

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : 'Submit Ticket'}
        </button>
        {/* {error && <p className="mt-2 text-sm text-red-600">⚠ {error}</p>} */}
      </div>
    </form>
  );
}
