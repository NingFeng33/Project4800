const express = require("express");
const router = express.Router();
const { renderDashboard } = require("../controllers/dashboard");
const { isAuthenticated } = require("../middleware/auth");

router.get("/", isAuthenticated, renderDashboard);

module.exports = router;
