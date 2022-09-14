const express = require("express");
const auth = require("./routes/auth");
const cors = require("cors");
const bodyParser = require("body-parser");
const test = require("dotenv").config();
console.log(test);

var app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 5000;

app.use("/auth", auth);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

module.exports = app;
