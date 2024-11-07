const express = require("express");
const router = express.Router();
const { Course } = require("../models/course");
const { Program } = require("../models/program");

router.get("/faculty", async (req, res) => {
  try {
    const courses = await Course.findAll();
    const programs = await Program.findAll();

    res.render("faculty", { programs, courses });
  } catch (error) {
    console.error("Error fetching data from database:", error);
    res.status(500).send("Error fetching data from database");
  }
});

module.exports = router;
