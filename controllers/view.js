const Program = require("../models/program");
const Course = require("../models/course");

// GET: calender view
exports.renderCalendar = async (req, res) => {
  try {
    const programs = await Program.findAll();
    const courses = await Course.findAll();

    // Check if req.session.user exists
    if (!req.session.user) {
      console.error("User is not defined in session.");
      return res.redirect("/"); // Redirect to login if user not in session
    }

    res.render("view", {
      user: req.session.user,
      programs: programs,
      courses: courses,
    });
  } catch (error) {
    console.error("Error rendering calendar:", error);
    res.status(500).send("Server Error");
  }
};
