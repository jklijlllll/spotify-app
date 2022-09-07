const express = require("express");

const auth = require("./routes/auth");

const port = 5000;

var app = express();

app.use("/auth", auth);

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});

module.exports = app;
