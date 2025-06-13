"use client";

import { useEffect, useState } from "react";
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
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

type UploadedFile = {
  name: string;
  type: string;
  url: string;
};

type Platform = { _id: string; name: string };
type Organization = { _id: string; name: string };

export default function SubmitTicketForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: "",
    platform: "",
    subject: {
      title: "",
      description: "",
    },
    contactNumber: "",
    category: "",
    priority: "",
    attachments: [] as UploadedFile[],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  const router = useRouter();

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [platformRes, orgRes] = await Promise.all([
          fetch("/api/platforms"),
          fetch("/api/organizations"),
        ]);
        const [platformData, orgData] = await Promise.all([
          platformRes.json(),
          orgRes.json(),
        ]);
        setPlatforms(platformData);
        setOrganizations(orgData);
      } catch (error) {
        console.error("Failed to fetch platforms or organizations", error);
      }
    };

    fetchOptions();
  }, []);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.organization) newErrors.organization = "Organization is required";
    if (!formData.platform) newErrors.platform = "Platform is required";
    if (!formData.subject.title) newErrors.subject = "Subject is required";
    if (!formData.subject.description) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.priority) newErrors.priority = "Priority is required";

    const regex = /^\d{10}$/;
    if (formData.contactNumber && !regex.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const formBody = new FormData();

    formBody.append("name", formData.name);
    formBody.append("email", formData.email);
    formBody.append("contactNumber", formData.contactNumber);
    formBody.append("title", formData.subject.title);
    formBody.append("description", formData.subject.description);
    formBody.append("category", formData.category);
    formBody.append("priority", formData.priority);
    formBody.append("platform", formData.platform);
    formBody.append("organization", formData.organization);
    formBody.append("type", "Support");

    formBody.append("attachments", JSON.stringify(formData.attachments.map(file => file.url)));

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        body: formBody,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // toast.success("Ticket submitted successfully!");
        setTicketId(result.data?._id || null); // ✅ Capture Ticket ID
        setIsSubmitted(true); // ✅ Show confirmation screen

        setFormData({
          name: "",
          email: "",
          organization: "",
          platform: "",
          subject: { title: "", description: "" },
          contactNumber: "",
          category: "",
          priority: "",
          attachments: [],
        });
      } else {
        toast.error(result.message || "Failed to submit ticket");
      }
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorClass = "border border-red-500";

  // ✅ Confirmation Screen
  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center bg-white p-8 rounded shadow">
        <h2 className="text-2xl font-semibold text-green-600 mb-4">Ticket Submitted!</h2>
        {/* <p className="text-gray-700 mb-2">Thank you for reaching out.</p> */}
        {ticketId && (
          <p className="text-sm text-gray-600">
            Your Ticket ID: <span className="font-mono">{ticketId}</span>
          </p>
        )}
              <div className="flex flex-col sm:flex-row justify-center gap-4">

        <Button className="mt-6 bg-blue-600 hover:bg-blue-700" onClick={() => setIsSubmitted(false)}>
          Submit Another Ticket
        </Button>
        
        <Button className="mt-6 bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/dashboard")}>
          Go to Dashboard
        </Button>
          </div>
      </div>
    );
  }

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
            <Select
              value={formData.organization}
              onValueChange={(val) => handleSelectChange("organization", val)}
            >
              <SelectTrigger className={errors.organization ? errorClass : ""}>
                <SelectValue placeholder="Select Organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org._id} value={org._id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.organization && <p className="text-red-500 text-sm">{errors.organization}</p>}
          </div>

          <div>
            <Select
              value={formData.platform}
              onValueChange={(val) => handleSelectChange("platform", val)}
            >
              <SelectTrigger className={errors.platform ? errorClass : ""}>
                <SelectValue placeholder="Select Platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform._id} value={platform._id}>
                    {platform.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.platform && <p className="text-red-500 text-sm">{errors.platform}</p>}
          </div>

          <div>
            <Input
              name="title"
              placeholder="Subject"
              value={formData.subject.title}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  subject: { ...prev.subject, title: e.target.value },
                }))
              }
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
            {errors.contactNumber && (
              <p className="text-red-500 text-sm">{errors.contactNumber}</p>
            )}
          </div>

          <div>
            <Select
              value={formData.category}
              onValueChange={(val) => handleSelectChange("category", val)}
            >
              <SelectTrigger className={errors.category ? errorClass : ""}>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bugs">Bugs</SelectItem>
                <SelectItem value="tech-support">Tech Support</SelectItem>
                <SelectItem value="feature-request">Feature Request</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
          </div>

          <div>
            <Select
              value={formData.priority}
              onValueChange={(val) => handleSelectChange("priority", val)}
            >
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

        <div>
          <Textarea
            name="description"
            placeholder="Describe your issue"
            value={formData.subject.description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                subject: { ...prev.subject, description: e.target.value },
              }))
            }
            className={errors.description ? errorClass : ""}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>

        <div>
          <FileUploader
            onUpload={(files) =>
              setFormData((prev: any) => ({
                ...prev,
                attachments: files,
              }))
            }
          />
        </div>

        <div className="flex justify-center">
          <Button className="bg-blue-700" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Ticket"}
          </Button>
        </div>
      </form>
    </div>
  );
}
