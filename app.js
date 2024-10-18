process.env.TZ = "America/Vancouver";
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const { sequelize, User, Role } = require("./models");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const programRoutes = require("./routes/programRoutes");
const resetRoutes = require("./routes/resetRoutes");
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const sessionStore = new SequelizeStore({ db: sequelize });

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);

sessionStore.sync();

app.use(authRoutes);
app.use(bookingRoutes);
app.use(programRoutes);
app.use(resetRoutes);
app.use(express.static("public"));

const PORT = process.env.PORT || 9040;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
