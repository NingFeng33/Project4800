process.env.TZ = 'America/Vancouver'
require("dotenv").config();
require('./config/sequelize');
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const { sequelize, User, Role } = require("./models");
const authRoutes = require("./routes/auth");
const manager = require('./routes/manager');
const dataRoutes = require('./routes/dataRoutes');
const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public'));

// 세션 설정
const sessionStore = new SequelizeStore({ db: sequelize });
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false, // 빈 세션 저장 방지
    cookie: { maxAge: 60 * 60 * 1000 }, // 1시간 지속 시간
  })
);

sessionStore.sync();

// 라우트 설정
app.use('/', manager);
app.use('/api', dataRoutes); // /api 경로로 dataRoutes 설정
app.use(authRoutes);

// /manager 경로 라우트
app.get('/manager', (req, res) => {
  res.render('manager');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
