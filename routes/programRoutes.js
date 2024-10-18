const express = require("express");
const {
  getPrograms,
  getCoursesByProgramId,
  viewProgramsAndCourses,
} = require("../controllers/programController");

const router = express.Router();

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
