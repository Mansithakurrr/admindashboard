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
import FileUploader from "@/components/FileUploader";
import toast, { Toaster } from "react-hot-toast";
type UploadedFile = {
  name: string;
  type: string;
  url: string;
};

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
    attachments: [] as UploadedFile[],
  });

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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
  
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          attachments: formData.attachments.map((file) => file.url),
        }),
      });
  
      const result = await res.json();
  
      if (!res.ok) throw new Error(result.message || "Ticket submission failed");
  
      // ✅ Show success toast
      toast.success("Ticket submitted successfully!");
  
      // ✅ Reset form
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
        attachments: [],
      });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false); // ✅ Ensures button resets no matter what
    }
  };
  


  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!validate()) return;

  //   setIsSubmitting(true);
  //   try {
  //     const res = await fetch("/api/tickets", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         ...formData,
  //         attachments: formData.attachments.map((file) => file.url),
  //       }),
  //     });

  //     const result = await res.json();

  //     if (!res.ok) throw new Error(result.message || "Ticket submission failed");

  //     // ✅ Show success toast
  //     toast.success("Ticket submitted successfully!");

  //     // ✅ Reset form
  //     setFormData({
  //       name: "",
  //       email: "",
  //       organization: "",
  //       platform: "",
  //       subject: "",
  //       description: "",
  //       contactNumber: "",
  //       category: "",
  //       type: "",
  //       priority: "",
  //       attachments: [],
  //     });
  //   } catch (err: any) {
  //     toast.error(err.message || "Something went wrong.");
  //   }

  // };

  const errorClass = "border border-red-500";

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-md mt-6 w-full">
      <h1 className="text-2xl font-semibold mb-6 text-center">Submit a Ticket</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? errorClass : ""}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div>
            <Input
              name="email"
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? errorClass : ""}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div>
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
          </div>

          <div>
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
          </div>

          <div>
            <Input
              name="subject"
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              className={errors.subject ? errorClass : ""}
            />
            {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
          </div>

          <div>
            <Input
              name="contactNumber"
              placeholder="Contact Number"
              value={formData.contactNumber}
              onChange={handleChange}
              className={errors.contactNumber ? errorClass : ""}
            />
            {errors.contactNumber && <p className="text-red-500 text-sm">{errors.contactNumber}</p>}
          </div>

          <div>
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
          </div>

          <div>
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
          </div>

          <div>
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
          </div>
        </div>

        {/* Description full width */}
        <div>
          <Textarea
            name="description"
            placeholder="Describe your issue"
            value={formData.description}
            onChange={handleChange}
            className={errors.description ? errorClass : ""}
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
        </div>

        {/* File Upload */}
        <div>
          <FileUploader
            onUpload={(files) =>
              setFormData((prev) => ({
                ...prev,
                attachments: files,
              }))
            }
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button className="bg-blue-700" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Ticket"}
          </Button>
        </div>
      </form>
    </div>
  );
}
