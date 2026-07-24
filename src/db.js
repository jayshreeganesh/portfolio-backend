import mongoose from "mongoose";

let connected = false;

/**
 * Connect to MongoDB if MONGODB_URI is set. Returns true on success.
 * If no URI is configured or the connection fails, the app continues in
 * "no-DB" mode (messages are logged instead of stored) so the demo still runs.
 */
export async function connectDB(uri) {
  if (!uri) {
    console.warn("⚠️  No MONGODB_URI set — running in no-DB mode (messages will be logged).");
    return false;
  }
  try {
    await mongoose.connect(uri);
    connected = true;
    console.log("✅ MongoDB connected");
    return true;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.warn("⚠️  Falling back to no-DB mode.");
    return false;
  }
}

export function isConnected() {
  return connected;
}
