const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
  getLogin,
  getSignup,
  postLogin,
  postSignup,
  getDashboard,
  logout,
} = require("../controllers/authController");
const router = express.Router();

router.get("/", getLogin);
router.get("/signup", getSignup);
router.get("/logout", logout);

router.post("/login", postLogin);
router.post("/signup", postSignup);

router.get("/admin/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { message: "Welcome to the Admin Dashboard" });
});

router.get("/faculty/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { message: "Welcome to the Faculty Dashboard" });
});

router.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { message: "Welcome to the Dashboard" });
});

module.exports = router;
