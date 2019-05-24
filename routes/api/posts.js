const express = require("express");
const router = express.Router();

// route: api/posts
// Test Route
// access: public
router.get("/", (req, res) => res.json({ msg: "Posts route is working" }));

module.exports = router;
