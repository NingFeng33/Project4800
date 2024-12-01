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

    // Extract filter values from the query parameters sent by the client
    const { programId, courseId } = req.query;

    try {
        // Build the where clause for filtering bookings
        const whereClause = {};
        if (courseId) {
            whereClause.course_id = courseId; // Filter by course ID if provided
        }

        // Define the include clauses for related models
        const includeClauses = [
            {
                model: Room, // Include the Room model to fetch room details
                attributes: ['room_number'], // Only fetch the room number
            },
            {
                model: Course, // Include the Course model to fetch course details
                attributes: ['course_name', 'course_code'], // Fetch course name and code
                where: programId ? { program_id: programId } : {} // Filter by program ID if provided
            }
        ];

        // Fetch bookings based on the filters and includes
        const bookings = await Booking.findAll({
            where: whereClause, // Apply the where clause for filtering
            include: includeClauses, // Include related models (Room and Course)
            attributes: ['room_id', 'start_time', 'end_time', 'course_id'] // Only fetch required fields
        });

        // Map the results to include only the necessary fields for the response
        const bookingData = bookings.map(booking => ({
            room_id: booking.room_id,
            room_number: booking.Room.room_number, // Room number from the Room model
            course_id: booking.course_id,
            course_name: booking.Course?.course_name || 'N/A', // Course name from the Course model
            course_code: booking.Course?.course_code || 'N/A', // Course code from the Course model
            start_time: booking.start_time,
            end_time: booking.end_time
        }));

        // Fetch user data (optional, for additional display purposes)
        const users = await User.findAll({
            attributes: ['user_id', 'F_Name', 'L_Name'], // Fetch user details
            include: {
                model: Role, // Include the Role model if needed
                attributes: ['role_name'] // Fetch the role name
            }
        });

        // Log the response for debugging purposes
        console.log({ bookings: bookingData, users });

        // Return the filtered booking data and user details as a JSON response
        res.json({ bookings: bookingData, users });
    } catch (error) {
        // Handle any errors during the query process
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