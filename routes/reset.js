const express = require("express");
const { getReset, updatePassword } = require("../controllers/reset");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// Routes for password reset
router.get("/", getReset);
router.patch("/update-password", isAuthenticated, updatePassword);

module.exports = router;
