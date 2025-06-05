"use client";

import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";

export default function SubmitTicketForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    platform: "",
    subject: "",
    description: "",
    contactNumber: "",
    category: "",
    type: "",
    priority: "",
  });

  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.organization) newErrors.organization = "Organization is required";
    if (!formData.platform) newErrors.platform = "Platform is required";
    if (!formData.subject) newErrors.subject = "Subject is required";
    if (!formData.description) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.type) newErrors.type = "Type is required";
    if (!formData.priority) newErrors.priority = "Priority is required";
    if (formData.contactNumber && formData.contactNumber.length < 10) {
      newErrors.contactNumber = "Contact number must be 10 digits";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const onDrop = (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => file.size <= 10 * 1024 * 1024); // 10MB max
    if (files.length + validFiles.length > 5) {
      alert("You can upload up to 5 files only.");
      return;
    }
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 10 * 1024 * 1024,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
      "text/plain": [],
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const payload = new FormData();

    // Object.entries(formData).forEach(([key, value]) => {
    //   if (value instanceof File) {
    //     payload.append("attachments", value); // assuming backend expects "attachments"
    //   } else if (typeof value === "string") {
    //     payload.append(key, value);
    //   }
    // });

    Object.entries(formData).forEach(([key, value]) => {
      payload.append(key, value);
    });

    files.forEach(file => payload.append("attachments", file));

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        body: payload,
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || "Submission failed");

      alert("Ticket submitted successfully!");
      setFormData({
        name: "",
        email: "",
        organization: "",
        platform: "",
        subject: "",
        description: "",
        contactNumber: "",
        category: "",
        type: "",
        priority: "",
      });
      setFiles([]);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorClass = "border border-red-500";

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-md mt-6">
      <h1 className="text-2xl font-semibold mb-4">Submit a Ticket</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input name="name" placeholder="Name" value={formData.name} onChange={handleChange} className={errors.name ? errorClass : ""} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

        <Input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleChange} className={errors.email ? errorClass : ""} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

        <Select onValueChange={(val) => handleSelectChange("organization", val)}>
          <SelectTrigger className={errors.organization ? errorClass : ""}>
            <SelectValue placeholder="Select Organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Msil">Msil</SelectItem>
            <SelectItem value="Rohtak">Rohtak</SelectItem>
            <SelectItem value="Udyog Vihar">Udyog Vihar</SelectItem>
            <SelectItem value="Tag Avenue">Tag Avenue</SelectItem>
          </SelectContent>
        </Select>
        {errors.organization && <p className="text-red-500 text-sm">{errors.organization}</p>}

        <Select onValueChange={(val) => handleSelectChange("platform", val)}>
          <SelectTrigger className={errors.platform ? errorClass : ""}>
            <SelectValue placeholder="Select Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Lighthouse">Lighthouse</SelectItem>
            <SelectItem value="Learn Tank">Learn Tank</SelectItem>
            <SelectItem value="Home Certify">Home Certify</SelectItem>
          </SelectContent>
        </Select>
        {errors.platform && <p className="text-red-500 text-sm">{errors.platform}</p>}

        <Input name="subject" placeholder="Subject" value={formData.subject} onChange={handleChange} className={errors.subject ? errorClass : ""} />
        {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}

        <Textarea name="description" placeholder="Describe your issue" value={formData.description} onChange={handleChange} className={errors.description ? errorClass : ""} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

        <Select onValueChange={(val) => handleSelectChange("priority", val)}>
          <SelectTrigger className={errors.priority ? errorClass : ""}>
            <SelectValue placeholder="Select Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        {errors.priority && <p className="text-red-500 text-sm">{errors.priority}</p>}

        <Input name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} className={errors.contactNumber ? errorClass : ""} />
        {errors.contactNumber && <p className="text-red-500 text-sm">{errors.contactNumber}</p>}

        <Select onValueChange={(val) => handleSelectChange("category", val)}>
          <SelectTrigger className={errors.category ? errorClass : ""}>
            <SelectValue placeholder="Select Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bugs">Bugs</SelectItem>
            <SelectItem value="Tech support">Tech Support</SelectItem>
            <SelectItem value="new feature">New Feature</SelectItem>
            <SelectItem value="others">Others</SelectItem>
          </SelectContent>
        </Select>
        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}

        <Select onValueChange={(val) => handleSelectChange("type", val)}>
          <SelectTrigger className={errors.type ? errorClass : ""}>
            <SelectValue placeholder="Select Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Support">Support</SelectItem>
            <SelectItem value="Complaint">Complaint</SelectItem>
            <SelectItem value="Feedback">Feedback</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}

        {/* 🟦 Dropzone */}
        <div>
          <label className="block text-sm font-medium mb-1">Attachments</label>
          <div
            {...getRootProps()}
            className={`w-full p-4 border-2 border-dashed rounded-md text-center cursor-pointer ${
              isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300"
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-sm text-blue-600">Drop files here...</p>
            ) : (
              <p className="text-sm text-gray-600">Drag & drop files here, or click to select (max 5 files, 10MB each)</p>
            )}
          </div>
          {files.length > 0 && (
            <ul className="mt-2 text-sm text-gray-700 space-y-1">
              {files.map((file, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 text-xs ml-2"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Ticket"}
        </Button>
      </form>
    </div>
  );
}
