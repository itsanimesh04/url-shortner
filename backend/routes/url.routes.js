const express = require("express");
const router = express.Router() ;

const urlController = require("../controllers/url.controller");

router.post("/", urlController.createShortUrl);
router.get("/:shortCode", urlController.redirectToUrl);

module.exports = router;