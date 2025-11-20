import URL from "../models/urlModel.js"; // URL Mongoose model
import shortid from "shortid";

// Create a new short link
export const createShortLink = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    if (!originalUrl) return res.status(400).json({ error: "originalUrl required" });

    const shortId = shortid.generate();
    const newUrl = new URL({ originalUrl, shortId });
    await newUrl.save();

    res.json({
      originalUrl,
      shortUrl: `http://localhost:5000/${shortId}`,
      clicks: 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Redirect to original URL
export const redirectLink = async (req, res) => {
  try {
    const { id } = req.params;
    const url = await URL.findOne({ shortId: id });
    if (!url) return res.status(404).send("URL not found");

    url.clicks += 1;
    await url.save();

    res.redirect(url.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
