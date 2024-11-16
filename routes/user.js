const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");

router.get("/current", isAuthenticated, (req, res) => {
  res.json({ userId: req.session.user.user_id });
});

module.exports = router;
