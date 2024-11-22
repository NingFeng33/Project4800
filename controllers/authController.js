const { User, Role, Room, Booking, Course, RoomRental, sequelize, FacultyAssignment } = require("../models");
//const sequelize = require("../config/db");
const bcrypt = require("bcrypt");
const { Op } = require('sequelize');
const { toZonedTime, format } = require('date-fns-tz');
const moment = require("moment-timezone");

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
          res.redirect("/admin/dashboard");
          break;
        case 'Faculty':
          res.redirect("/faculty");
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

// Check room availability
exports.checkRoomAvailability = async (req, res) => {
  const { date, endDate, startTime, endTime, courseId } = req.body;

  if (!date || !endDate || !startTime || !endTime) {
    console.error("Missing one or more required fields.");
    return res.status(400).json({ success: false, message: "Missing one or more required fields." });
  }

  try {
    const availableRooms = await Room.findAvailableRooms(date, endDate, startTime, endTime, courseId);
    res.json({ success: true, availableRooms });
  } catch (error) {
    console.error("Error checking room availability:", error);
    res.status(500).json({ success: false, message: "Error checking room availability" });
  }
};

// Book a room
exports.bookRoom = async (req, res) => {
  const { roomId, date, endDate, startTime, endTime, courseId, facultyIds } = req.body;

  // Combine date and time into a single string
  const formattedStartTimePST = `${date} ${startTime}:00`;
  const formattedEndTimePST = `${endDate} ${endTime}:00`;

  // Convert PST time to UTC using moment-timezone
  const formattedStartTimeUTC = moment.tz(formattedStartTimePST, 'America/Vancouver').utc().format('YYYY-MM-DD HH:mm:ss');
  const formattedEndTimeUTC = moment.tz(formattedEndTimePST, 'America/Vancouver').utc().format('YYYY-MM-DD HH:mm:ss');

  const insertBookingQuery = `
    INSERT INTO Room_Booking
    (room_id, course_id, start_time, end_time, booking_date, end_date, booking_status)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  const insertFacultyAssignmentQuery = `
    INSERT INTO Faculty_Assignment
    (book_id, user_id)
    VALUES (?, ?);
  `;

  const transaction = await sequelize.transaction();

  try {
    // Insert the booking and get the booking ID
    const [result] = await sequelize.query(insertBookingQuery, {
      replacements: [roomId, courseId, formattedStartTimeUTC, formattedEndTimeUTC, date, endDate, 'booked'],
      type: sequelize.QueryTypes.INSERT,
      transaction,
    });

    const bookingId = result;

    // Assign faculty users to the booking
    if (Array.isArray(facultyIds)) {
      for (const facultyId of facultyIds) {
        await sequelize.query(insertFacultyAssignmentQuery, {
          replacements: [bookingId, facultyId],
          type: sequelize.QueryTypes.INSERT,
          transaction,
        });
      }
    }

    // Commit the transaction
    await transaction.commit();

    res.json({ success: true, message: "Room booked successfully and faculty assigned." });
  } catch (error) {
    console.error("Error booking room and assigning faculty:", error);

    // Rollback the transaction in case of error
    await transaction.rollback();

    res.status(500).json({ success: false, message: "Error booking room and assigning faculty" });
  }
};

exports.rentalRoom = async (req, res) => {
  const { roomId, date, endDate, startTime, endTime, purpose } = req.body;
  const formattedStartTime = `${date} ${startTime}:00`;
  const formattedEndTime = `${endDate} ${endTime}:00`;

  const renterName = null;  

    const insertQuery = `
        INSERT INTO Room_Rental
        (room_id, renter_name, start_time, end_time, purpose)
        VALUES (?, ?, ?, ?, ?);
    `;

    try {
        await sequelize.query(insertQuery, {
            replacements: [roomId, renterName, formattedStartTime, formattedEndTime, purpose],
            type: sequelize.QueryTypes.INSERT
        });
        res.status(201).json({ success: true, message: "Room rental booked successfully" });
    } catch (error) {
        console.error("Error booking room rental:", error);
        res.status(500).json({ success: false, message: "Error booking room rental" });
    }
}


exports.getAdminDashboard = async (req, res) => {
  try {
  
  const today = moment().tz('America/Vancouver').format('YYYY-MM-DD hh:mm:ss A');
  console.log("Current time in Vancouver timezone:", today);

    // Fetch today's bookings
    const todayBookings = await Booking.findAll({
      //where: { booking_date: formattedDate },
      include: [
        { model: Course, attributes: ['course_name', 'course_code'] },
        { model: Room, attributes: ['room_number'] },
        {
          model: FacultyAssignment,
          as: 'FacultyAssignments',
          include: {
            model: User,
            as: 'User',
            attributes: ['F_Name', 'L_Name'],
          },
        },
      ]
    });

      const convertedBookings = todayBookings.map(booking => {
      const startTime = moment.tz(booking.start_time, 'UTC').tz('America/Vancouver');
      const endTime = moment.tz(booking.end_time, 'UTC').tz('America/Vancouver');
      const assignedFaculty = booking.FacultyAssignments.map(faculty => {
        return `${faculty.User.F_Name} ${faculty.User.L_Name}`;
      }).join(', ');

      console.log("Start Time in Vancouver:", startTime.format('YYYY-MM-DD hh:mm:ss A'));
      console.log("End Time in Vancouver:", endTime.format('YYYY-MM-DD hh:mm:ss A'));
      return {
        ...booking.dataValues,
        displayStartTime: startTime.format('YYYY-MM-DD hh:mm A'),
        displayEndTime: endTime.format('YYYY-MM-DD hh:mm A'),
        assignedFaculty
      };
    });

    
    console.log("Bookings for today:", convertedBookings);

    // Fetch future bookings
    const futureBookings = await Booking.findAll({
      where: {
        booking_date: {
          [Op.gt]: today,
        },
      },
      include: [
        { model: Course, attributes: ['course_name', 'course_code'] },
        { model: Room, attributes: ['room_number'] },
        {
          model: FacultyAssignment,
          as: 'FacultyAssignments',
          include: {
            model: User,
            as: 'User',
            attributes: ['F_Name', 'L_Name'],
          },
        },
      ],
      order: [['booking_date', 'ASC'], ['start_time', 'ASC']],
    });
    
    const convertedFutureBookings = futureBookings.map(booking => {
      const startTime = moment.tz(booking.start_time, 'UTC').tz('America/Vancouver');
      const endTime = moment.tz(booking.end_time, 'UTC').tz('America/Vancouver');
    
      const assignedFaculty = booking.FacultyAssignments.map(faculty => {
        return `${faculty.User.F_Name} ${faculty.User.L_Name}`;
      }).join(', ');
    
      return {
        ...booking.dataValues,
        displayStartTime: startTime.format('YYYY-MM-DD hh:mm A'),
        displayEndTime: endTime.format('YYYY-MM-DD hh:mm A'),
        assignedFaculty, // Add assigned faculty to the booking
      };
    });    

    console.log("Future bookings:", convertedFutureBookings);

    // Render dashboard with both today's bookings and future bookings
    res.render('dashboard', { bookings: convertedBookings, convertedFutureBookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).send('Server Error');
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ include: Role });
    res.render('users', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Server Error');
  }
};

exports.getAddUser = (req, res) => {
  res.render('addUser'); // Render a view for adding a new user
};

exports.postAddUser = async (req, res) => {
  const { firstName, lastName, email, role, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const roleRecord = await Role.findOne({ where: { role_name: role } });
    if (!roleRecord) {
      return res.status(400).send("Invalid role specified");
    }

  try {
    await User.create({ 
      F_Name: firstName, 
      L_Name: lastName, 
      email, 
      role_id: roleRecord.role_id, 
      password: hashedPassword 
    });
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).send('Server Error');
  }
};

exports.getEditUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    const roles = await Role.findAll();

    if (!user) return res.status(404).send('User not found');
    res.render('editUser', { user, roles });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Server Error');
  }
};

exports.postEditUser = async (req, res) => {
  const { user_id, firstName, lastName, email } = req.body;
  const roleId = Role === "Admin" ? 1 : 2; 
  try {
    await User.update(
      { F_Name: firstName, L_Name: lastName, email, role_id: parseInt(roleId) },
      { where: { user_id } }
  );
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).send('Server Error');
  }
};

exports.deactivateUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.update({ active: false }, { where: { user_id: id } });
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).send('Server Error');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    await User.destroy({ where: { user_id: userId } });
    res.redirect('/admin/users'); 
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).send('Server Error');
  }
};