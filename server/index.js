const express = require("express");
const dotenv = require("dotenv");

const auth = require("./routes/auth");

const port = 5000;

dotenv.config();
var app = express();

app.use("/auth", auth);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

module.exports = app;
