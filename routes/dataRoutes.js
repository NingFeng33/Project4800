const express = require('express');
const router = express.Router();
const { Course } = require('../models/course');
const { Room } = require('../models/room');
const { Program } = require('../models/program');
const { Booking } = require('../models/booking');

// Use method-override to support DELETE requests in HTML forms
const methodOverride = require('method-override');
router.use(methodOverride('_method'));

// GET: Home page showing courses and rooms
router.get('/', async (req, res) => {
  try {
    const courses = await Course.findAll();
    const rooms = await Room.findAll();
    const bookings = await Booking.findAll({
      include: [Course, Room],
    });

    res.render('dashboard', { courses, rooms, bookings });
  } catch (error) {
    console.error('Failed to fetch data:', error);
    res.status(500).send('Error fetching data');
  }
});

// POST: Add a new course
router.post('/courses', async (req, res) => {
  const { courseCode, courseName, programName, startDate, endDate } = req.body;

  try {
    let program;

    // Check if a program with the given name already exists
    program = await Program.findOne({ where: { program_name: programName } });

    // If program doesn't exist, create a new one
    if (!program) {
      program = await Program.create({
        program_name: programName
      });
    }

    // Now create the course using the program's ID
    await Course.create({
      course_code: courseCode,
      course_name: courseName,
      program_id: program.program_id,  // Use the auto-generated program_id
      start_date: startDate,
      end_date: endDate,
    });

    res.redirect('/');
  } catch (error) {
    console.error('Failed to add course:', error);
    res.status(500).json({ error: 'Failed to add course due to a server error.' });
  }
});

// DELETE: Remove a course
router.delete('/courses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Course.destroy({ where: { id } });
    res.redirect('/');
  } catch (error) {
    console.error('Failed to delete course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// POST: Add a new room
router.post('/rooms', async (req, res) => {
  const { roomNumber, capacity } = req.body; 

  try {
    await Room.create({
      room_number: roomNumber,
      capacity: capacity  
    });
    res.redirect('/');
  } catch (error) {
    console.error('Failed to add room:', error);
    res.status(500).json({ error: 'Failed to add room due to server error.' });
  }
});

// DELETE: Remove a room
router.delete('/rooms/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Room.destroy({ where: { id } });
    res.redirect('/');
  } catch (error) {
    console.error('Failed to delete room:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.findAll(); 
    res.json(bookings);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
