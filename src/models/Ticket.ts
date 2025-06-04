
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
); // _id: false if you manage IDs manually or they are part of a larger object

const TicketSchema = new mongoose.Schema(
  {
    // _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    serialNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: { type: String, required: true },

    platformName: {
      type: String,
      enum: ['Lighthouse', 'Learn Tank', 'Home Certify'],
      required: true
    },
    Organization: {
      type: String,
      enum: ["Msil", "Rohtak", "Udyog Vihar", "Tag Avenue"],
      required: true
    },
    subject: {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
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
      // default: "medium",
    },
    type: {
      type: String,
      enum: ["Support", "Complaint", "Feedback"],
      required: true,
    },
    // days: {
    //   type: Number,
    //   required: true,
    //   min: [1, "Resolution period must be at least 1 day"],
    // },
    closedAt: { type: Date },
    activityLog: [ActivityLogEntrySchema], // Store activity log directly
  },
  { timestamps: true }
); // This gives you createdAt and updatedAt


export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
