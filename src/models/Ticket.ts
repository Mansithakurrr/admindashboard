import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
    sno: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    // subject: { type: String, required: true },
    // description: { type: String, required: true },
    platformName: { type: String, required: true },
    Organization: { type: String, required: true },
    subject: {
        title: { type: String, required: true },
        description: { type: String, required: true }
      },      
    status: {
        type: String,
        enum: ['New', 'Open', 'Hold', 'InProgress', 'Resolve', 'Closed'],
        default: 'Open'
    },
    category: {
        type: String,
        enum: ['bugs', 'Tech support', 'new feature', 'others'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    type: {
        type: String,
        enum: ['Support', 'Complaint', 'Feedback'],
        required: true
    },
    days: {
        type: Number,
        required: true
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
