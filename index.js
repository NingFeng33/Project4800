require('dotenv').config();
const dataRoutes = require('./routes/dataRoutes');
const login = require('./routes/auth')
const express = require('express');
const app = express();
const methodOverride = require('method-override');
const { initializeDatabase } = require('./config/db');
const path = require('path');
const Sequelize = require('sequelize');

app.set('view engine', 'ejs');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//app.use(methodOverride('_method'));
app.use('/', dataRoutes);
app.use(express.static(path.join(__dirname, 'public')));

initializeDatabase()
  .then(() => {
    console.log('Connected to the database.');
    app.listen(3000, () => {
      console.log('Server is running on http://localhost:3000');
    });
  })
  .catch(err => {
    console.error('Failed to connect to the database:', err);
  });

