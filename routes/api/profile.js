const express = require("express");
const router = express.Router();

// route: api/profile
// Test Route
// access: public
router.get("/", (req, res) => res.json({ msg: "Users route is working" }));

module.exports = router;
