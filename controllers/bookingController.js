const { sequelize } = require("../config/db");
const { User } = require("../models/user");
const { Role } = require("../models/role");
const { Room } = require("../models/room");
const { Booking } = require("../models/booking");
const { Course } = require("../models/course");

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

exports.bookRoom = async (req, res) => {
  const { roomId, date, endDate, startTime, endTime, courseId } = req.body;
  console.log("Received booking data:", {
    roomId,
    date,
    endDate,
    startTime,
    endTime,
    courseId,
  });
  // Convert date and time to proper datetime format
  const formattedStartTime = `${date} ${startTime}:00`;
  const formattedEndTime = `${endDate} ${endTime}:00`;
  console.log("Formatted date and time:", formattedStartTime, formattedEndTime);
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
        formattedEndTime, // Already formatted as 'YYYY-MM-DD HH:MM:SS'
        date,
        endDate,
        "booked",
      ],
      type: sequelize.QueryTypes.INSERT,
    });
    res.json({ success: true, message: "Room booked successfully" });
  } catch (error) {
    console.error("Error booking room:", error);
    res.status(500).send("Error booking room");
  }
};
