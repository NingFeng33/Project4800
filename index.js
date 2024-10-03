require('dotenv').config();
const express = require('express');
const app = express();
const initializeDatabase = require('./config/db');

app.set('view engine', 'ejs'); // Set EJS as view engine


// Middleware
app.use(express.json());


// Route definition
app.get('/', (req, res) => {
    res.send('Welcome to Project4800');
});

app.get('/view', (req, res) => {
    res.render('view'); // This will render view.ejs
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

