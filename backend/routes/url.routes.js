const express = require("express");
const router = express.Router();

const urlController = require("../controllers/url.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.use(authMiddleware);

router.post("/", urlController.createShortUrl);
router.get("/:shortCode", urlController.redirectToUrl);

module.exports = router;
