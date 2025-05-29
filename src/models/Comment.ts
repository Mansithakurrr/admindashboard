import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  text: { type: String, required: true },
  author: { type: String, required: true }, // can be user email, name, or ID
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
