
// src/models/Ticket.ts
import mongoose from "mongoose";
import Counter from "./Counter";

const ActivityLogEntrySchema = new mongoose.Schema(
  {
    id: String,
    timestamp: { type: Date, default: Date.now },
    user: String,
    action: String,
    from: String,
    to: String,
    details: String,
  },
  { _id: false }
);

const AttachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  originalName: { type: String, required: true },
});

const SubjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const TicketSchema = new mongoose.Schema(
  {
    serialNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: {
      type: String,
      validate: {
        validator: function (v: string) {
          return v === "" || /^\d{10}$/.test(v);
        },
        message: () => `Contact number must be a 10-digit number!`,
      },
    },
    platformId: { type: mongoose.Schema.Types.ObjectId, ref: "Platform", required: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    subject: { type: SubjectSchema, required: true },
    status: {
      type: String,
      enum: ["New", "Open", "Hold", "InProgress", "Resolved", "Closed"],
      default: "New",
    },
    category: {
      type: String,
      enum: ["bugs", "Tech support", "new feature", "others"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
    },
    type: {
      type: String,
      enum: ["Support", "Complaint", "Feedback"],
    },
    attachments: [AttachmentSchema],
    resolvedRemarks: String,
    closedAt: Date,
    activityLog: [], // Add schema if needed
  },
  { timestamps: true }
);

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);