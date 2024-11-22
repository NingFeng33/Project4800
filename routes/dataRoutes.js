const express = require('express');
const router = express.Router();
const { fetchData } = require('../controllers/authController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const { User, Booking, Room, Course, Role } = require('../models');



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
                    attributes: ['course_name', 'course_code'],
                }
            ],
            attributes: ['room_id', 'start_time', 'end_time', 'course_id']
        });

        const bookingData = bookings.map(booking => ({
            room_id: booking.room_id,
            room_number: booking.Room.room_number,
            course_id: booking.course_id,
            course_name: booking.Course?.course_name || 'N/A',
            course_code: booking.Course?.course_code || 'N/A',
            start_time: booking.start_time,
            end_time: booking.end_time
        }));

        const users = await User.findAll({
            attributes: ['user_id', 'F_Name', 'L_Name'],
            include: {
                model: Role,
                attributes: ['role_name'] // Fetch role if needed
            }
        });

        console.log({ bookings: bookingData, users });


        res.json({ bookings: bookingData, users });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Error fetching bookings' });
    }
});

router.get('/facultyUsers', async (req, res) => {
    try {
        const facultyUsers = await User.findAll({
            where: { role_id: 2 }, // Assuming `2` is the role ID for faculty users
            attributes: ['user_id', 'F_Name', 'L_Name']
        });
        res.json(facultyUsers);
    } catch (error) {
        console.error('Error fetching faculty users:', error);
        res.status(500).json({ message: 'Error fetching faculty users' });
    }
});


module.exports = router;