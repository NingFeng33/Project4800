const Program = require("../models/program");
const Course = require("../models/course");

// GET: all programs
exports.getPrograms = async (_, res) => {
  try {
    const programs = await Program.findAll();
    res.json(programs);
  } catch (error) {
    console.error("Failed to fetch programs:", error);
    res.status(500).json({ message: "Failed to fetch programs" });
  }
};

// GET: get course by program id
exports.getCoursesByProgramId = async (req, res) => {
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
};

exports.viewProgramsAndCourses = async (req, res) => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    const programs = await Program.findAll();
    const courses = await Course.findAll();

    res.render("calendar", { programs, courses });
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).send("Error fetching data from database");
  }
};
