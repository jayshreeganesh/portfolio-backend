import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./db.js";
import contactRoutes from "./routes/contact.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
app.use(express.json({ limit: "10kb" }));

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
  })
);

// Throttle the contact endpoint to deter spam.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, errors: ["Too many requests. Please try again later."] },
});

// ---- Routes ----
app.get("/api/health", (_req, res) => res.json({ ok: true, status: "up" }));
app.use("/api/contact", contactLimiter, contactRoutes);

// 404
app.use((_req, res) => res.status(404).json({ ok: false, errors: ["Not found."] }));

// ---- Start ----
async function start() {
  await connectDB(process.env.MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
  });
}

start();

export default app;
