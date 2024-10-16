
const { User} = require("../models/user");
const { Role } = require("../models/role");
const { Room } = require('../models/room');
const { Booking } = require('../models/booking');
const { Course } = require('../models/course');
const { sequelize } = require('../config/db');
//const sequelize = require("../config/db");
const bcrypt = require("bcrypt");

console.log(Room);
// Login
exports.getLogin = (_req, res) => {
  res.render("login", { message: "" });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Role,
        attributes: ['role_name']
      }]
    });

    if (!user) {
      return res.render("login", { message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("login", { message: "Invalid email or password." });
    }

    // Assume the Role model is correctly defined and linked
    const roleName = user.Role.role_name;  // Adjust according to actual model linkage

    req.session.userId = user.user_id;
    req.session.role = roleName;  // Store the role name for easier checks

    req.session.save(() => {
      switch(roleName) {
        case 'Admin':
          res.redirect("/admin/booking");
          break;
        case 'Faculty':
          res.redirect("/faculty/dashboard");
          break;
        default:
          res.redirect("/dashboard");
      }
    });
  } catch (error) {
    console.error(error);
    res.render("login", {
      message: "An error occurred. Please try again."
    });
  }
};

// Sign up
exports.getSignup = (req, res) => {
  res.render("signup", { message: "" });
};

exports.postSignup = async (req, res) => {
  const { first_name, last_name, email, password, confirm_password, role_name } = req.body;
  
  if (password !== confirm_password) {
    return res.render("signup", { message: "Passwords do not match." });
  }
  
  try {
    // Check if the email is already used
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render("signup", { message: "Email already in use." });
    }

    // Retrieve the role_id based on the role_name provided
    const role = await Role.findOne({ where: { role_name } });
    if (!role) {
      return res.render("signup", { message: "Invalid role selected." });
    }
    const role_id = role.role_id;

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create the user
    await User.create({
      F_Name: first_name,
      L_Name: last_name,
      email,
      password: password_hash,
      role_id
    });

    // Redirect to login page after successful registration
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.render("signup", {
      message: "An error occurred. Please try again.",
    });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect("/dashboard");
    }
    res.redirect("/");
  });
};

exports.checkRoomAvailability = async (req, res) => {
  const { date, endDate, startTime, endTime, courseId } = req.body;
  console.log('Received data:', { date, endDate, startTime, endTime, courseId });

  if (!date || !endDate || !startTime || !endTime || !courseId) {
      console.error('Missing one or more required fields.');
      return res.status(400).json({ success: false, message: 'Missing one or more required fields.' });
  }

  try {
      const availableRooms = await Room.findAvailableRooms(date, endDate, startTime, endTime, courseId);
      res.json({ success: true, availableRooms });
  } catch (error) {
      console.error('Error checking room availability:', error);
      res.status(500).send('Error checking room availability');
  }
};

exports.bookRoom = async (req, res) => {
  const { roomId, date, endDate, startTime, endTime, courseId } = req.body;
  console.log('Received booking data:', { roomId, date, endDate, startTime, endTime, courseId });
  // Convert date and time to proper datetime format
  const formattedStartTime = `${date} ${startTime}:00`;
  const formattedEndTime = `${endDate} ${endTime}:00`;
  console.log('Formatted date and time:', formattedStartTime, formattedEndTime);
  // try {
  //     const newBooking = await Booking.create({
  //         room_id: roomId,
  //         course_id: courseId,
  //         start_time: formattedStartTime, // 'YYYY-MM-DD HH:MM:SS'
  //         end_time: formattedEndTime,     // 'YYYY-MM-DD HH:MM:SS'
  //         booking_date: date,
  //         end_date: endDate,
  //         booking_status: 'booked'
  //     });
  //     res.json({ success: true, message: 'Room booked successfully', bookingId: newBooking.book_id });
  // } 
  const insertQuery = `
  INSERT INTO Room_Booking
  (room_id, course_id, start_time, end_time, booking_date, end_date, booking_status)
  VALUES (?, ?, ?, ?, ?, ?, ?);
`;

try {
  await sequelize.query(insertQuery, {
    replacements: [
      roomId,
      courseId,
      formattedStartTime, // Already formatted as 'YYYY-MM-DD HH:MM:SS'
      formattedEndTime,   // Already formatted as 'YYYY-MM-DD HH:MM:SS'
      date,
      endDate,
      'booked'
    ],
    type: sequelize.QueryTypes.INSERT
  });
  res.json({ success: true, message: 'Room booked successfully' });
} catch (error) {
      console.error('Error booking room:', error);
      res.status(500).send('Error booking room');
  }
};

// Dashboard
// exports.getDashboard = (_req, res) => {
//   res.render("dashboard", { message: "" });
// };
