
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


const TicketSchema = new mongoose.Schema(
  {
    // _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    serialNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    contactNumber: {
      type: String,
      validate: {
          validator: function(v: string) {
              // This validator allows empty strings, making the field optional.
              // It only runs the regex test if a value is provided.
              if (v === null || v.trim() === '') {
                  return true;
              }
              // Use the regex from your frontend validation
              return /^\d{10}$/.test(v); 
          },
          message: (props: { value: string }) => `Contact number must be a 10-digit number!`
      },
      required: false // Explicitly make it not required
  },

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
    },
    type: {
      type: String,
      enum: ["Support", "Complaint", "Feedback"],
      // required: true,
    },
    attachments: [
      String
    ],
    resolvedRemarks: String,
    closedAt: { type: Date },
    activityLog: [ActivityLogEntrySchema],
  },
  { timestamps: true }
);


export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
