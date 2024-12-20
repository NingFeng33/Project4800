process.env.TZ = 'UTC'
require("dotenv").config();
require('./config/sequelize');
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const { sequelize, User, Role} = require("./models");
const authRoutes = require("./routes/auth");
const manager = require('./routes/manager');
const factuly = require('./routes/facultyRoutes');
const userRoutes = require('./routes/userRoutes');
const dataRoutes = require('./routes/dataRoutes');
const app = express();
const { isAuthenticated, isAdmin } = require('./middleware/authMiddleware');

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use('/admin', manager, userRoutes);
app.use(factuly); 


const sessionStore = new SequelizeStore({ db: sequelize });

app.get('/admin/manager', isAuthenticated, isAdmin, (req, res) => {
  res.render('manager');
});

app.get('/factuly', isAuthenticated, (req, res) => {
  res.render('factuly');
});

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);

sessionStore.sync();

app.use('/', manager);
app.use('/api', dataRoutes);
app.use(authRoutes);
app.use(express.static('public'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;