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

app.get('/view', async (req, res) => {
    try {
        const db = await initializeDatabase();
        console.log('Database connected successfully!');

        // Fetching data for Program and Courses from the database
        const [programs] = await db.execute('SELECT * FROM Program');
        console.log('Programs fetched:', programs); // Log the fetched program data

        const [courses] = await db.execute('SELECT * FROM Courses');
        console.log('Courses fetched:', courses);  // Log the fetched course data

        res.render('view', { programs, courses });  // Send the data to the view
    } catch (error) {
        console.error('Error fetching data from database:', error);
        res.status(500).send('Error fetching data from database');
    }
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

