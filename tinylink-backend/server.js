import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors({ origin: "http://localhost:3000" })); // allow frontend
app.use(bodyParser.json());

// MongoDB connection
const MONGO_URI = "mongodb+srv://admin-21:Sailaxmi21@fns.u3vkz9e.mongodb.net/tinylink?retryWrites=true&w=majority";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// URL schema
const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortId: { type: String, unique: true },
  clicks: { type: Number, default: 0 },
  lastClicked: { type: Date, default: null },
});

const URL = mongoose.model("URL", urlSchema);

// Helper: Generate random code
const generateCode = (min = 6, max = 8) => {
  const length = Math.floor(Math.random() * (max - min + 1)) + min;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

// Health check
app.get("/healthz", (req, res) => res.json({ ok: true, version: "1.0" }));

// Get all links
app.get("/api/urls", async (req, res) => {
  try {
    const urls = await URL.find().sort({ _id: -1 });
    res.json(urls.map(u => ({
      originalUrl: u.originalUrl,
      shortUrl: `${req.protocol}://${req.get("host")}/${u.shortId}`,
      clicks: u.clicks,
      lastClicked: u.lastClicked,
      shortId: u.shortId
    })));
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Create new link
app.post("/api/links", async (req, res) => {
  try {
    const { originalUrl, customCode } = req.body;
    if (!/^https?:\/\/.+/.test(originalUrl))
      return res.status(400).json({ error: "Invalid URL format" });

    const shortId = customCode || generateCode();
    const exists = await URL.findOne({ shortId });
    if (exists) return res.status(409).json({ error: "Custom code already exists" });

    const newUrl = new URL({ originalUrl, shortId });
    await newUrl.save();

    res.json({
      originalUrl,
      shortUrl: `${req.protocol}://${req.get("host")}/${shortId}`,
      clicks: 0,
      lastClicked: null,
      shortId
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

// Get stats for a code
app.get("/api/links/:code", async (req, res) => {
  const { code } = req.params;
  const url = await URL.findOne({ shortId: code });
  if (!url) return res.status(404).json({ error: "Not found" });
  res.json({
    originalUrl: url.originalUrl,
    shortUrl: `${req.protocol}://${req.get("host")}/${url.shortId}`,
    clicks: url.clicks,
    lastClicked: url.lastClicked,
    shortId: url.shortId
  });
});

// Delete a link
app.delete("/api/links/:code", async (req, res) => {
  const { code } = req.params;
  const url = await URL.findOneAndDelete({ shortId: code });
  if (!url) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

// Redirect
app.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const url = await URL.findOne({ shortId });
  if (!url) return res.status(404).send("URL not found");

  url.clicks += 1;
  url.lastClicked = new Date();
  await url.save();
  res.redirect(url.originalUrl);
});

app.listen(5000, () => console.log("Backend running on http://localhost:5000"));
