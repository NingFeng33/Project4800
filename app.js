const express = require("express");
const session = require("express-session");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const path = require("path");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const dotenv = require("dotenv");

dotenv.config();

const { sequelize } = require("./config/db");
require("./models"); // Import models to initialize associations

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/booking");
const programRoutes = require("./routes/program");
const notificationRoutes = require("./routes/notifications");
const resetRoutes = require("./routes/reset");
const calendarRoutes = require("./routes/view");
const managerRoutes = require("./routes/manager");
const userRoutes = require("./routes/user");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // Initialize Socket.IO with the server

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Make io accessible in your routes and controllers
app.set("io", io);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

const sessionStore = new SequelizeStore({ db: sequelize });

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret_key",
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);

sessionStore.sync();

app.use(express.static("public"));

// Set up routes
app.use("/", authRoutes);
app.use("/bookings", bookingRoutes);
app.use("/view", calendarRoutes);
app.use("/programs", programRoutes);
app.use("/notifications", notificationRoutes);
app.use("/reset", resetRoutes);
app.use("/manager", managerRoutes);
app.use("/user", userRoutes);
app.use("/dashboard", dashboardRoutes);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("A user connected");

  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(`user_${userId}`);
  }
});

// Start the server using the HTTP server instance
const PORT = process.env.PORT || 9041;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server };
