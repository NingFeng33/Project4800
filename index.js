require('dotenv').config();
const express = require('express');
const app = express();
const initializeDatabase = require('./config/db');

// Middleware
app.use(express.json());

// Route definition
app.get('/', (req, res) => {
    res.send('Welcome to Project4800');
});

// Server and database initialization
(async () => {
    try {
        const db = await initializeDatabase();
        console.log('Database connected successfully!');
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
})();

