const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/auth.routes");
const urlRoutes = require("./routes/url.routes");
const redirectRoutes = require("./routes/redirect.routes");

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes); // ✅ public — signup/login
app.use("/api/urls", urlRoutes); // ✅ protected — CRUD + analytics
app.use("/", redirectRoutes); // ✅ public — short link redirect

module.exports = app;
