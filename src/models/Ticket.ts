import mongoose from 'mongoose';

const TicketSchema = new mongoose.Schema({
    sno:{
        type: Number,
        required:true,
        unique:true
    },
    serialNumber: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email:{type:String,required:true},
    contactNumber:{type:String,required:true},
    platformName: {
        type: String,
        enum: ['Lighthouse', 'Learn Tank', 'Home Certify'],
        required: true
    },
    Organization: {
        type: String,
        enum:["Msil","Rohtak","Udyog Vihar","Tag Avenue"],
        required: true
    },
    subject: {
        title: { type: String, required: true },
        description: { type: String, required: true }
    },
    status: {
        type: String,
        enum: ['New', 'Open', 'Hold', 'InProgress', 'Resolved', 'Closed'],
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
}, { timestamps: true });

export default mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
