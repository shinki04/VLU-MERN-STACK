const express = require("express");
const router = express.Router();

// Utils
const JwtUtil = require("../utils/JwtUtil");

// DAOs
const AdminDAO = require("../models/AdminDAO");

// Login
router.post("/login", async function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    const admin = await AdminDAO.selectByUsernameAndPassword(
      username,
      password,
    );
    if (admin) {
      const token = JwtUtil.genToken(username, password);
      res.json({
        success: true,
        message: "Authentication successful",
        token: token,
      });
    } else {
      res.json({ success: false, message: "Incorrect username or password" });
    }
  } else {
    res.json({ success: false, message: "Please input username and password" });
  }
});

// Verify Token
router.get("/token", JwtUtil.checkToken, function (req, res) {
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7);
  }
  res.json({ success: true, message: "Token is valid", token: token });
});

module.exports = router;
