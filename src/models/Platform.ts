import mongoose from "mongoose";

const PlatformSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  // description: String, // optional description
}, { timestamps: true });

export default mongoose.models.Platform || mongoose.model("Platform", PlatformSchema);
