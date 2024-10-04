require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const initializeDatabase = require('./config/db');

// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static('public')); // Serve static files from the public directory

// Set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve the index page with ejs
app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to Project4800' }); // You can pass additional data as needed
});

app.get('/booking', (req, res) => {
    res.render('booking');
});


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
    }
})();
