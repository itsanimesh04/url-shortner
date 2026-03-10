const Url = require("../models/Url");
const generateShortCode = require("../utils/generateShortCode");
const dns = require("dns").promises ;

exports.createShortUrl = async (req, res) => {
  try {
    const { longUrl } = req.body;
    // URL validation
    try {
    //   new URL(longUrl);
    const hostname = new URL(longUrl).hostname ;
    await dns.lookup(hostname);
    } catch {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    const shortCode = generateShortCode();

    const url = await Url.create({
      longUrl,
      shortCode,
    });

    res.status(201).json({
      shortCode: url.shortCode,
      shortUrl: `http://localhost:3001/${url.shortCode}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.redirectToUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await Url.findOne({ shortCode });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    return res.redirect(url.longUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
