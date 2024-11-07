const express = require("express");
const {
  getPrograms,
  getCoursesByProgramId,
  viewProgramsAndCourses,
} = require("../controllers/program");
const Program = require("../models/program");
const Course = require("../models/course");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// Fetch all programs - API route
router.get("/", isAuthenticated, getPrograms);

// Endpoint to get courses by program ID
router.get("/courses/:programId", isAuthenticated, getCoursesByProgramId);

// View programs and courses
router.get("/calendar", isAuthenticated, viewProgramsAndCourses);

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

module.exports = router;
