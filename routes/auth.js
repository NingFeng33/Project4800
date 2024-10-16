const { DataTypes, Op } = require("sequelize");
const { sequelize } = require("../config/db");
const express = require("express");
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
  getLogin,
  getSignup,
  postLogin,
  postSignup,
  getDashboard,
  logout,
  checkRoomAvailability,
  bookRoom,
} = require("../controllers/authController");
const { Program } = require("../models/program");
const { Course } = require("../models/course");
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

// Render the booking page
router.get("/admin/booking", isAuthenticated, (req, res) => {
  res.render("booking");
});

// API to check room availability
router.post(
  "/admin/booking/check-availability",
  isAuthenticated,
  checkRoomAvailability
);
//router.post('/booking/check-availability', checkRoomAvailability);
// API to book a room
router.post("/admin/booking/book-room", isAuthenticated, bookRoom);

// Fetch all programs - API route
router.get("/api/programs", async (req, res) => {
  try {
    const programs = await Program.findAll();
    res.json(programs);
  } catch (error) {
    console.error("Failed to fetch programs:", error);
    res.status(500).json({ message: "Failed to fetch programs" });
  }
});

// Endpoint to get courses by program ID
router.get("/api/courses/:programId", async (req, res) => {
  try {
    const programId = req.params.programId;
    const courses = await Course.findAll({
      where: { program_id: programId },
    });
    res.json(courses);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

router.get("/view", async (req, res) => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    const programs = await Program.findAll();
    const courses = await Course.findAll();

    console.log("Programs:", programs);
    console.log("Courses:", courses);

    res.render("view", { programs, courses });
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).send("Error fetching data from database");
  }
});

module.exports = router;
