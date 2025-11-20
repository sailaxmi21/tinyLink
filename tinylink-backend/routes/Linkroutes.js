import express from "express";
import { createShortLink, redirectLink } from "../controllers/linkController.js";

const router = express.Router();

// Create a new short link
router.post("/shorten", createShortLink);

// Redirect using shortId
router.get("/:id", redirectLink);

export default router;
