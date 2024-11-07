const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const { renderCalendar } = require("../controllers/view");
const Program = require("../models/program");
const Course = require("../models/course");

// Render Calendar

router.get("/", isAuthenticated, renderCalendar);

// Add other routes for calendar functionality
router.get(
  "/programs/courses/:programId",
  isAuthenticated,
  async (req, res) => {
    try {
      const courses = await Course.findAll({
        where: {
          program_id: req.params.programId,
        },
      });
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  }
);

router.get("/bookings/all", isAuthenticated, async (req, res) => {
  try {
    // Add your booking fetching logic here
    // Example:
    const bookings = []; // Replace with actual booking fetch
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
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
