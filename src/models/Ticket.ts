// import mongoose from 'mongoose';

// const TicketSchema = new mongoose.Schema({
//     serialNumber: { type: String, required: true, unique: true },
//     name: { type: String, required: true },
//     // subject: { type: String, required: true },
//     // description: { type: String, required: true },
//     platformName: { type: String, required: true },
//     Organization: { type: String, required: true },
//     subject: {
//         title: { type: String, required: true },
//         description: { type: String, required: true }
//       },
//     status: {
//         type: String,
//         enum: ['New', 'Open', 'Hold', 'InProgress', 'Resolved', 'Closed'],
//         default: 'Open'
//     },
//     category: {
//         type: String,
//         enum: ['bugs', 'Tech support', 'new feature', 'others'],
//         required: true
//     },
//     priority: {
//         type: String,
//         enum: ['low', 'medium', 'high'],
//         default: 'medium'
//     },
//     type: {
//         type: String,
//         enum: ['Support', 'Complaint', 'Feedback'],
//         required: true
//     },
//     days: {
//         type: Number,
//         required: true
//     },
// }, { timestamps: true });

// export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
// src/models/Ticket.ts
import mongoose from "mongoose";

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
    serialNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    platformName: { type: String, required: true },
    Organization: { type: String, required: true },
    subject: {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["New", "Open", "Hold", "InProgress", "Resolved", "Closed"],
      default: "Open",
    },
    category: {
      type: String,
      enum: ["bugs", "Tech support", "new feature", "others"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    type: {
      type: String,
      enum: ["Support", "Complaint", "Feedback"],
      required: true,
    },
    days: { type: Number, required: true },
    activityLog: [ActivityLogEntrySchema], // Store activity log directly
  },
  { timestamps: true }
); // This gives you createdAt and updatedAt

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
