const express = require("express");

const {
  getEmail,
  getReset,
  updatePassword,
} = require("../controllers/resetController");
const { isAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

// API when a user forgets password
router.get("/email", getEmail);
// API when a user want to reset ones password
router.get("/reset", getReset);

// Route to update user's password
router.patch("/update-password", updatePassword);

module.exports = router;
