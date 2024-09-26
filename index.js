// index.js
require('dotenv').config();
const express = require('express');
const app = express();
const initializeDatabase = require('./config/db');
// Middleware to parse JSON
app.use(express.json());

// Start the server
const PORT = process.env.PORT || 3000;

(async () => {
    try {
        const db = await initializeDatabase();
        console.log('Database connected successfully!');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        // Handle failure more gracefully here if necessary
    }
})();

// In your index.js or wherever your routes are defined
app.get('/', (req, res) => {
    res.send('Welcome to Project4800');
});
