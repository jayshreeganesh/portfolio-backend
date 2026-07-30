import { Router } from "express";
import Counter from "../models/Counter.js";
import { isConnected } from "../db.js";

const router = Router();

const KEY = "visits";

// In-memory fallback so the counter still works without MongoDB
// (resets when the server restarts).
let memoryCount = 0;

/** GET /api/visits — read the current count without incrementing. */
router.get("/", async (_req, res) => {
  try {
    if (isConnected()) {
      const doc = await Counter.findOne({ key: KEY });
      return res.json({ ok: true, visits: doc ? doc.value : 0, persisted: true });
    }
    return res.json({ ok: true, visits: memoryCount, persisted: false });
  } catch (err) {
    console.error("Error reading visits:", err.message);
    return res.status(500).json({ ok: false, errors: ["Could not read visit count."] });
  }
});

/** POST /api/visits — increment and return the new count. */
router.post("/", async (_req, res) => {
  try {
    if (isConnected()) {
      // Atomic increment, creating the document on first hit.
      const doc = await Counter.findOneAndUpdate(
        { key: KEY },
        { $inc: { value: 1 } },
        { new: true, upsert: true }
      );
      return res.json({ ok: true, visits: doc.value, persisted: true });
    }
    memoryCount += 1;
    return res.json({ ok: true, visits: memoryCount, persisted: false });
  } catch (err) {
    console.error("Error incrementing visits:", err.message);
    return res.status(500).json({ ok: false, errors: ["Could not update visit count."] });
  }
});

export default router;
