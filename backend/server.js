require("dotenv").config();

const app = require("./app");
const connetDB = require("./config/db");

const PORT = process.env.PORT;

connetDB();


app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
