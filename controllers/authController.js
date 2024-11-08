const { User, Role, Room, Booking, Course, sequelize } = require("../models");
const bcrypt = require("bcrypt");

// Login page rendering
exports.getLogin = (_req, res) => {
  res.render("login", { message: "" });
};

// Login POST handler
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Role,  // Include Role model to get role_name
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

    // Retrieve role name from the Role association
    const roleName = user.Role ? user.Role.role_name : null;

    req.session.userId = user.user_id;
    req.session.role = roleName;

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
    console.error("Error during login:", error);
    res.render("login", { message: "An error occurred. Please try again." });
  }
};

// Signup page rendering
exports.getSignup = (req, res) => {
  res.render("signup", { message: "" });
};

// Signup POST handler
exports.postSignup = async (req, res) => {
  const { first_name, last_name, email, password, confirm_password, role_name } = req.body;

  if (password !== confirm_password) {
    return res.render("signup", { message: "Passwords do not match." });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render("signup", { message: "Email already in use." });
    }

    const role = await Role.findOne({ where: { role_name } });
    if (!role) {
      return res.render("signup", { message: "Invalid role selected." });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await User.create({
      F_Name: first_name,
      L_Name: last_name,
      email,
      password: password_hash,
      role_id: role.role_id
    });

    res.redirect("/");
  } catch (error) {
    console.error("Error during signup:", error);
    res.render("signup", { message: "An error occurred. Please try again." });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.redirect("/dashboard");
    }
    res.redirect("/");
  });
};

// Check room availability
exports.checkRoomAvailability = async (req, res) => {
  const { date, endDate, startTime, endTime, courseId } = req.body;

  if (!date || !endDate || !startTime || !endTime || !courseId) {
    console.error("Missing one or more required fields.");
    return res.status(400).json({ success: false, message: "Missing one or more required fields." });
  }

  try {
    // `findAvailableRooms` 메서드 호출
    const availableRooms = await Room.findAvailableRooms(date, endDate, startTime, endTime, courseId);
    res.json({ success: true, availableRooms });
  } catch (error) {
    console.error("Error checking room availability:", error);
    res.status(500).json({ success: false, message: "Error checking room availability" });
  }
};

// Book a room
exports.bookRoom = async (req, res) => {
  const { roomId, date, endDate, startTime, endTime, courseId } = req.body;

  const formattedStartTime = `${date} ${startTime}:00`;
  const formattedEndTime = `${endDate} ${endTime}:00`;

  const insertQuery = `
    INSERT INTO Room_Booking
    (room_id, course_id, start_time, end_time, booking_date, end_date, booking_status)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  try {
    await sequelize.query(insertQuery, {
      replacements: [roomId, courseId, formattedStartTime, formattedEndTime, date, endDate, 'booked'],
      type: sequelize.QueryTypes.INSERT
    });
    res.json({ success: true, message: "Room booked successfully" });
  } catch (error) {
    console.error("Error booking room:", error);
    res.status(500).json({ success: false, message: "Error booking room" });
  }
};
