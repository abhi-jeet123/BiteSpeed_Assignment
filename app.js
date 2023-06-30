const express = require("express");
const contactRoute = require("./routes/contactRoutes");
const app = express();

// app.get("/", (req, res) => {
//   res.send("Hello, world!");
// });
app.use(express.json());
app.use("/api/identify", contactRoute);

module.exports = app;
