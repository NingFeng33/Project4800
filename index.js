
require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const initializeDatabase = require('./config/db');
const dataRoutes = require('./routes/dataRoutes');
const userRoutes = require('./routes/userRoutes');
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING); 

const models = {
  Role: require('./role')(sequelize, Sequelize.DataTypes),
  User: require('./user')(sequelize, Sequelize.DataTypes),
  // add other models here
};

// Initialize associations
Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
// Middleware to parse JSON and serve static files
app.use(express.json());
app.use(express.static('public')); 
app.use('/api', dataRoutes);
// app.use('/admin',userRoutes);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


// Serve the index page with ejs
app.get('/', (req, res) => {
    res.render('index', { title: 'Welcome to Project4800' }); 
});

// app.get('/booking', isAdmin, isAuthenticated, (req, res) => {
//     res.render('booking');
// });

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