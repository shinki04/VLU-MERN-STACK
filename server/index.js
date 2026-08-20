require("dotenv").config();

//! Dùng đoạn code này nếu bạn bị lỗi
const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "1.0.0.1"]);

const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares (must be declared before routes)
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Built-in Express alternatives (Express 4.16+):
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// APIs / Routes
app.get("/hello", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// APIs
app.use("/api/admin", require("./api/admin.js"));
app.use("/api/customer", require("./api/customer.js"));

// Start Server (placed at the bottom)
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
 