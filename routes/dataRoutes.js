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

module.exports = router;