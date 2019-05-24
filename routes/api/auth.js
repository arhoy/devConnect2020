const express = require("express");
const router = express.Router();

// route: api/auth
// Test Route
// access: public
router.get("/", (req, res) => res.json({ msg: "Auth route is working" }));

module.exports = router;
