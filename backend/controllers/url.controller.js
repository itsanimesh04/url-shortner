const Url = require("../models/Url");
const generateShortCode = require("../utils/generateShortCode");
const dns = require("dns").promises;

exports.createShortUrl = async (req, res) => {
  try {
    const { longUrl } = req.body;

    try {
      const hostname = new URL(longUrl).hostname;
      await dns.lookup(hostname);
    } catch {
      return res.status(400).json({
        message: "Invalid or unreachable URL",
      });
    }

    let shortCode;
    let exists = true;

    while (exists) {
      shortCode = generateShortCode();
      exists = await Url.findOne({ shortCode });
    }

    await Url.create({
      longUrl,
      shortCode,
      userId: req.user.userId,
    });

    res.status(201).json({
      shortCode,
      shortUrl: `http://localhost:3001/${shortCode}`,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

exports.redirectToUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({
        message: "URL not found",
      });
    }

    return res.redirect(url.longUrl);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
