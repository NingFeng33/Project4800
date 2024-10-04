// routes/dataRoutes.js
const express = require('express');
const router = express.Router();
const { fetchData } = require('../controllers/dataController');

router.get('/', async (req, res) => {
    try {
        const data = await fetchData();
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Error fetching data" });
    }
});

router.get('/programs', async (req, res) => {
    try {
        const programs = await Program.findAll();
        res.json(programs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching programs" });
    }
});

router.get('/courses/:programId', async (req, res) => {
    try {
        const courses = await Course.findAll({
            where: { program_id: req.params.programId }
        });
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: "Error fetching courses" });
    }
});

router.post('/rooms/availability', async (req, res) => {
    const { date, startTime, endTime } = req.body;
    try {
        const availableRooms = await Room.getAvailableRooms(date, startTime, endTime);
        res.json(availableRooms);
    } catch (err) {
        res.status(500).json({ message: "Error checking room availability" });
    }
});


module.exports = router;