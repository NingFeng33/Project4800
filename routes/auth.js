const express = require("express");
const {
  getLogin,
  getSignup,
  postLogin,
  postSignup,
  logout,
} = require("../controllers/auth");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

router.get("/", getLogin);
router.post("/login", postLogin);
router.get("/signup", getSignup);
router.post("/signup", postSignup);
router.get("/logout", logout);

module.exports = router;
