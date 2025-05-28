import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
    serialNumber: { type: String, required: true, unique: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    platformName: { type: String, required: true },
    orgName: { type: String, required: true },
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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
