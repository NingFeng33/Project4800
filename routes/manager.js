const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const Room = require("../models/room");
const Program = require("../models/program");
const { Booking } = require("../models/booking");

// GET: manager page showing courses and rooms
router.get("/", async (req, res) => {
  try {
    const courses = await Course.findAll({ include: [Program] });
    const rooms = await Room.findAll();
    const programs = await Program.findAll();

    res.render("manager", { courses, rooms, programs });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    res.status(500).send("Error fetching data");
  }
});

// POST: Add a new course
router.post("/courses", async (req, res) => {
  const { courseCode, courseName, programName, startDate, endDate } = req.body;

  try {
    let program;

    // Check if a program with the given name already exists
    program = await Program.findOne({ where: { program_name: programName } });

    // If program doesn't exist, create a new one
    if (!program) {
      program = await Program.create({
        program_name: programName,
      });
    }

    await Course.create({
      course_code: courseCode,
      course_name: courseName,
      program_id: program.program_id,
      start_date: startDate,
      end_date: endDate,
    });

    res.redirect("/manager");
  } catch (error) {
    console.error("Failed to add course:", error);
    res
      .status(500)
      .json({ error: "Failed to add course due to a server error." });
  }
});

// Delete course by ID
// router.delete('/courses/:id', async (req, res) => {
//   try {
//       await Course.destroy({ where: { course_id: req.params.id } });
//       res.redirect('/manager');
//   } catch (error) {
//       console.error('Error deleting course:', error);
//       res.status(500).send('Error deleting course');
//   }
// });

// POST: Add a new room
router.post("/rooms", async (req, res) => {
  const { roomNumber, capacity } = req.body;

  try {
    await Room.create({
      room_number: roomNumber,
      capacity: capacity,
    });
    res.redirect("/");
  } catch (error) {
    console.error("Failed to add room:", error);
    res.status(500).json({ error: "Failed to add room due to server error." });
  }
});

// Delete room by ID
// router.delete('/rooms/:id', async (req, res) => {
//   try {
//       await Room.destroy({ where: { room_id: req.params.id } });
//       res.redirect('/manager');
//   } catch (error) {
//       console.error('Error deleting room:', error);
//       res.status(500).send('Error deleting room');
//   }
// });

// Fetch paginated courses
router.get("/courses", async (req, res) => {
  const { page = 1, limit = 5 } = req.query; // Default to page 1, limit 5
  try {
    const { count, rows: courses } = await Course.findAndCountAll({
      include: "Program",
      limit: parseInt(limit), // Convert to number
      offset: (page - 1) * limit, // Calculate offset
    });
    res.json({
      courses,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).send("Error fetching courses");
  }
});

// Fetch paginated rooms
router.get("/rooms", async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  try {
    const { count, rows: rooms } = await Room.findAndCountAll({
      limit: parseInt(limit),
      offset: (page - 1) * limit,
    });
    res.json({
      rooms,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).send("Error fetching rooms");
  }
});

module.exports = router;
