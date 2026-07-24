import { Router } from "express";
import Message from "../models/Message.js";
import { isConnected } from "../db.js";

const router = Router();

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate the contact payload. Returns an array of error strings. */
function validate({ name, email, message }) {
  const errors = [];
  if (!name || !name.trim()) errors.push("Name is required.");
  if (!email || !emailRe.test(email.trim())) errors.push("A valid email is required.");
  if (!message || message.trim().length < 10)
    errors.push("Message must be at least 10 characters.");
  return errors;
}

// POST /api/contact — submit a contact message
router.post("/", async (req, res) => {
  const errors = validate(req.body || {});
  if (errors.length) {
    return res.status(400).json({ ok: false, errors });
  }

  const { name, email, message } = req.body;

  try {
    if (isConnected()) {
      const saved = await Message.create({ name, email, message });
      return res.status(201).json({ ok: true, id: saved._id, message: "Message stored." });
    }
    // No-DB fallback: log so the demo works without MongoDB.
    console.log("📨 Contact message (not persisted):", { name, email, message });
    return res.status(200).json({ ok: true, message: "Message received (no-DB mode)." });
  } catch (err) {
    console.error("Error saving message:", err.message);
    return res.status(500).json({ ok: false, errors: ["Server error. Please try again later."] });
  }
});

// GET /api/contact — list messages (simple admin/debug helper; DB only)
router.get("/", async (_req, res) => {
  if (!isConnected()) {
    return res.status(503).json({ ok: false, errors: ["Database not connected."] });
  }
  const messages = await Message.find().sort({ createdAt: -1 }).limit(100);
  res.json({ ok: true, count: messages.length, messages });
});

export default router;
