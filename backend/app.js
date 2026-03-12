const express = require("express");
const cors = require("cors");
const app = express();
const urlRoutes = require("./routes/url.routes")
const authRoutes = require("./routes/auth.routes")

app.use(cors())
app.use(express.json())


app.use("/api/urls",urlRoutes);
app.use("/", urlRoutes);
app.use("/api/auth", authRoutes);




module.exports=app ;