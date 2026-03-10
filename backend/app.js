const express = require("express");
const cors = require("cors");
const app = express();
const urlRoutes = require("./routes/url.routes")

app.use(cors())
app.use(express.json())


app.use("/api/urls",urlRoutes);
app.use("/", urlRoutes);


module.exports=app ;