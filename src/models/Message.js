import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
