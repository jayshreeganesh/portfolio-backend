import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { connectDB } from "./db.js";
import contactRoutes from "./routes/contact.js";
import visitRoutes from "./routes/visits.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
// Hosts like Render/Railway/Fly put the app behind a proxy. Without this, every
// request looks like it comes from the proxy's IP and the rate limiter would
// throttle all users as one bucket.
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.use(express.json({ limit: "10kb" }));

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    methods: ["GET", "POST"],
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
app.use("/api/visits", visitRoutes);

// 404
app.use((_req, res) => res.status(404).json({ ok: false, errors: ["Not found."] }));

// ---- Start ----
async function start() {
  await connectDB(process.env.MONGODB_URI);
  // Bind 0.0.0.0 so the container/host can route traffic in — binding to
  // localhost would make the app unreachable and fail platform health checks.
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
}

start();

export default app;
