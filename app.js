// app.js
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const { sequelize, User, Role } = require("./models");
const authRoutes = require("./routes/auth");
const manager = require('./routes/manager');
const dataRoutes = require('./routes/dataRoutes'); // 추가된 dataRoutes 불러오기

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use('/', manager);

const sessionStore = new SequelizeStore({ db: sequelize });

app.get('/manager', (req, res) => {
  res.render('manager');
});

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
app.use(express.static('public'));

// dataRoutes를 사용하기 위해 아래 줄을 추가하세요.
app.use(dataRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
