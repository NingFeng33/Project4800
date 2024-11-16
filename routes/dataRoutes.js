const express = require('express');
const router = express.Router();
const { fetchData } = require('../controllers/authController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const { Booking, Room, Course } = require('../models');


router.get('/', async (req, res) => {
    try {
        const data = await fetchData();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching data" });
    }
});


router.get('/view', isAdmin, isAuthenticated, async (req, res) => {
    try {
        const db = await initializeDatabase();
        console.log('Database connected successfully!');

        const [programs] = await db.execute('SELECT * FROM Program');
        const [courses] = await db.execute('SELECT * FROM Courses');

        // Log data to verify it's fetched correctly
        console.log('Programs:', programs);
        console.log('Courses:', courses);

        res.render('view', { programs, courses });
    } catch (error) {
        console.error('Error fetching data from database:', error);
        res.status(500).send('Error fetching data from database');
    }
});

router.get('/bookings', isAdmin, isAuthenticated, async (req, res) => {
    console.log("GET request received at /api/bookings"); 
    try {
        const bookings = await Booking.findAll({
            include: [
                {
                    model: Room,
                    attributes: ['room_number'],
                },
                {
                    model: Course,
                    attributes: ['course_id'],
                }
            ],
            attributes: ['room_id', 'start_time', 'end_time', 'course_id']
        });

        const bookingData = bookings.map(booking => ({
            room_id: booking.room_id,
            room_number: booking.Room.room_number,
            course_id: booking.course_id,
            start_time: booking.start_time,
            end_time: booking.end_time
        }));

        res.json(bookingData);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

module.exports = router;