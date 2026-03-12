const express = require("express");
const router = express.Router();

const urlController = require("../controllers/url.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { createUrlSchema } = require("../validators/url.validator");

router.use(authMiddleware);

router.post("/", validate(createUrlSchema), urlController.createShortUrl);
router.get("/", urlController.getUserUrls);
router.get("/:id/analytics", urlController.getUrlAnalytics);
router.delete("/:id", urlController.deleteUrl);

module.exports = router;
