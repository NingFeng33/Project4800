const Room = require("../models/room");
const Booking = require("../models/booking");
const Course = require("../models/course");
const { Op } = require("sequelize");
const { notifyStaffBooking, sendNotificationToAll } = require("./notification");

// GET: renders booking page
exports.renderBookingPage = async (_, res) => {
  res.render("booking");
};

// GET: gets all bookings with associated room and course
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [{ model: Room }, { model: Course }],
    });
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching bookings" });
  }
};

// POST: checks if rooms are available
exports.checkRoomAvailability = async (req, res) => {
  const { date, endDate, startTime, endTime, courseId } = req.body;
  console.log("Received data:", {
    date,
    endDate,
    startTime,
    endTime,
    courseId,
  });

  if (!date || !endDate || !startTime || !endTime || !courseId) {
    console.error("Missing one or more required fields.");
    return res.status(400).json({
      success: false,
      message: "Missing one or more required fields.",
    });
  }

  try {
    const availableRooms = await Room.findAvailableRooms(
      date,
      endDate,
      startTime,
      endTime,
      courseId
    );
    res.json({ success: true, availableRooms });
  } catch (error) {
    console.error("Error checking room availability:", error);
    res.status(500).send("Error checking room availability");
  }
};

// POST: book a room
exports.bookRoom = async (req, res) => {
  const { roomId, date, endDate, startTime, endTime, courseId } = req.body;

  if (!roomId || !date || !endDate || !startTime || !endTime || !courseId) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  const formattedStartTime = `${date} ${startTime}:00`;
  const formattedEndTime = `${endDate} ${endTime}:00`;

  try {
    // Create new booking
    const newBooking = await Booking.create({
      room_id: roomId,
      course_id: courseId,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      booking_date: date,
      end_date: endDate,
      booking_status: "booked",
    });

    // Fetch room and course details
    const room = await Room.findByPk(roomId);
    const course = await Course.findByPk(courseId);

    // Format the start and end times for the notification message
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    const startTimeFormatted = new Date(formattedStartTime).toLocaleString(
      "en-US",
      options
    );
    const endTimeFormatted = new Date(formattedEndTime).toLocaleString(
      "en-US",
      options
    );

    // Get user ID from session
    const userId = req.session.user.user_id;

    // Get Socket.IO instance from app
    const io = req.app.get("io");

    // Prepare detailed notification message
    const message = `A new booking for course ${course.course_name} in room ${room.room_number} has been confirmed from ${startTimeFormatted} to ${endTimeFormatted}.`;

    // Send notification to the user
    sendNotificationToAll(io, message, "/view");

    res.json({
      success: true,
      message: "Room booked successfully",
      bookingId: newBooking.book_id,
    });
  } catch (error) {
    console.error("Error booking room:", error);
    res.status(500).send("Error booking room");
  }
};
