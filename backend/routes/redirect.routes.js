const express = require("express");
const router = express.Router();

const urlController = require("../controllers/url.controller");

// No authMiddleware — this is a public route
router.get("/:shortCode", urlController.redirectToUrl);

module.exports = router;
