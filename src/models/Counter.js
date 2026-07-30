import mongoose from "mongoose";

// A single named counter document, e.g. { key: "visits", value: 42 }.
const counterSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Counter", counterSchema);
