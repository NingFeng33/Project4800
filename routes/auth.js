// routes/auth.js
const express = require("express");
const router = express.Router();
const { sequelize, Program, Course, User, Role, Room, Booking } = require('../models'); // models/index.js에서 모든 모델 불러오기
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

router.get('/admin/booking', isAuthenticated, (req, res) => {
  res.render('booking');
});

router.post('/admin/booking/check-availability', isAuthenticated, checkRoomAvailability);
router.post('/admin/booking/book-room', isAuthenticated, bookRoom);

router.get('/api/programs', async (req, res) => {
  try {
    const programs = await Program.findAll();
    res.json(programs);
  } catch (error) {
    console.error("Failed to fetch programs:", error);
    res.status(500).json({ message: 'Failed to fetch programs' });
  }
});

router.get('/api/courses/:programId', async (req, res) => {
  try {
    const programId = req.params.programId;
    const courses = await Course.findAll({ where: { program_id: programId } });
    res.json(courses);
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

router.get('/view', async (req, res) => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully!');
    const programs = await Program.findAll();
    const courses = await Course.findAll();
    console.log('Programs:', programs);
    console.log('Courses:', courses);
    res.render('view', { programs, courses });
  } catch (error) {
    console.error('Error fetching data from database:', error);
    res.status(500).send('Error fetching data from database');
  }
});

module.exports = router;
