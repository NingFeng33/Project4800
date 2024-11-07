// const { sequelize } = require("../config/db");
const Room = require("../models/room");
const Booking = require("../models/booking");
const Course = require("../models/course");
const { Op } = require("sequelize");

// GET: render booking page
exports.renderBookingPage = async (_, res) => {
  res.render("booking");
};

// GET: get all bookings
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

//
exports.checkRoomAvailability = async (req, res) => {
  const { date, startTime, endTime } = req.body;

  if (!date || !startTime || !endTime) {
    return res.status(400).json({
      success: false,
      message: "Date, start time, and end time are required.",
    });
  }

  try {
    const formattedStartTime = `${date} ${startTime}:00`;
    const formattedEndTime = `${date} ${endTime}:00`;

    const unavailableRooms = await Booking.findAll({
      attributes: ["room_id"],
      where: {
        [Op.or]: [
          {
            start_time: {
              [Op.between]: [formattedStartTime, formattedEndTime],
            },
          },
          {
            end_time: {
              [Op.between]: [formattedStartTime, formattedEndTime],
            },
          },
        ],
      },
    });

    const unavailableRoomIds = unavailableRooms.map(
      (booking) => booking.room_id
    );

    const availableRooms = await Room.findAll({
      where: {
        room_id: {
          [Op.notIn]: unavailableRoomIds,
        },
      },
    });

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
  const formattedEndTime = `${date} ${endTime}:00`;

  try {
    const newBooking = await Booking.create({
      room_id: roomId,
      course_id: courseId,
      start_time: formattedStartTime,
      end_time: formattedEndTime,
      booking_date: date,
      end_date: endDate,
      booking_status: "booked",
    });

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
