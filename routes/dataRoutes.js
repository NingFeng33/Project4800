// routes/dataRoutes.js
const express = require('express');
const router = express.Router();
const { Program, Course, Booking } = require('../models'); // Import Sequelize models

// Route to render the view.ejs with data from the database
router.get('/view', async (req, res) => {
    try {
        // Fetch all Program, Course, and Booking data
        const programs = await Program.findAll();
        const courses = await Course.findAll();
        const bookings = await Booking.findAll();

        // Pass the fetched data to view.ejs for rendering
        res.render('view', {
            programs,
            courses,
            bookings
        });
    } catch (error) {
        console.error('Error fetching data from database:', error);
        res.status(500).send('Error fetching data from database');
    }
});

// API route to fetch bookings based on optional filters for programId and courseId
router.get('/api/bookings', async (req, res) => {
    try {
        const { programId, courseId } = req.query; // Get programId and courseId from query parameters

        // Define the base query conditions
        const where = {};
        if (programId) where.program_id = programId;
        if (courseId) where.course_id = courseId;

        // Fetch bookings from the database based on conditions
        const bookings = await Booking.findAll({ where });

        res.json(bookings); // Return the fetched bookings as JSON
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

module.exports = router;
