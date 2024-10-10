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


router.get('/view', async (req, res) => {
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


module.exports = router;