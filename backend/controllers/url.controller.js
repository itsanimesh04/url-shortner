const Url = require("../models/Url");
const Click = require("../models/Click");
const generateShortCode = require("../utils/generateShortCode");
const dns = require("dns").promises;

// ✅ POST /api/urls — create a short URL (protected)
exports.createShortUrl = async (req, res) => {
  try {
    const { longUrl, customAlias } = req.body;

    // Validate URL is reachable
    try {
      const hostname = new URL(longUrl).hostname;
      await dns.lookup(hostname);
    } catch {
      return res.status(400).json({ message: "Invalid or unreachable URL" });
    }

    // Custom alias check
    if (customAlias) {
      const aliasExists = await Url.findOne({ shortCode: customAlias });
      if (aliasExists) {
        return res.status(409).json({ message: "Custom alias already in use" });
      }
    }

    // Generate unique short code
    let shortCode = customAlias;
    if (!shortCode) {
      let exists = true;
      while (exists) {
        shortCode = generateShortCode();
        exists = await Url.findOne({ shortCode });
      }
    }

    const url = await Url.create({
      longUrl,
      shortCode,
      userId: req.user.userId, // ✅ userId saved with every URL
    });

    const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

    res.status(201).json({
      _id: url._id,
      shortCode,
      shortUrl: `${BASE_URL}/${shortCode}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET /:shortCode — public redirect, saves click data
exports.redirectToUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    // ✅ Expired link check
    if (url.expiresAt && new Date() > url.expiresAt) {
      return res.status(410).json({ message: "This link has expired" });
    }

    // ✅ Increment click count
    await Url.findByIdAndUpdate(url._id, { $inc: { clickCount: 1 } });

    // ✅ Save click data
    const userAgent = req.headers["user-agent"] || "";
    const device = /mobile/i.test(userAgent) ? "mobile" : "desktop";
    const browserMatch = userAgent.match(
      /(Chrome|Firefox|Safari|Edge|Opera)[\/\s]([\d.]+)/
    );
    const browser = browserMatch ? browserMatch[1] : "unknown";

    await Click.create({
      urlId: url._id,
      userAgent,
      device,
      browser,
    });

    return res.redirect(url.longUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET /api/urls — get all URLs for the logged-in user only
exports.getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    });

    const BASE_URL = process.env.BASE_URL || "http://localhost:3001";

    res.json(
      urls.map((url) => ({
        _id: url._id,
        longUrl: url.longUrl,
        shortCode: url.shortCode,
        shortUrl: `${BASE_URL}/${url.shortCode}`,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt || null,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ GET /api/urls/:id/analytics — click analytics for one URL
exports.getUrlAnalytics = async (req, res) => {
  try {
    const url = await Url.findOne({
      _id: req.params.id,
      userId: req.user.userId, // ✅ only owner can view analytics
    });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    const clicks = await Click.find({ urlId: url._id }).sort({ createdAt: -1 });

    // Summary breakdown
    const deviceBreakdown = clicks.reduce((acc, c) => {
      acc[c.device] = (acc[c.device] || 0) + 1;
      return acc;
    }, {});

    const browserBreakdown = clicks.reduce((acc, c) => {
      acc[c.browser] = (acc[c.browser] || 0) + 1;
      return acc;
    }, {});

    res.json({
      url: {
        _id: url._id,
        shortCode: url.shortCode,
        longUrl: url.longUrl,
        clickCount: url.clickCount,
        createdAt: url.createdAt,
        expiresAt: url.expiresAt || null,
      },
      analytics: {
        totalClicks: clicks.length,
        deviceBreakdown,
        browserBreakdown,
        recentClicks: clicks.slice(0, 10), // last 10
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/urls/:id
exports.deleteUrl = async (req, res) => {
  try {
    const url = await Url.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    await Url.findByIdAndDelete(req.params.id);
    await Click.deleteMany({ urlId: req.params.id });

    res.json({ message: "URL deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
