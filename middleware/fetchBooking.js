// middleware/fetchBookings.js

const Booking = require("../models/booking");
const Room = require("../models/room");
const Course = require("../models/course");
const { Op } = require("sequelize");

exports.fetchBookings = async (req, res, next) => {
  try {
    const userId = req.session.user.user_id;
    const today = new Date().toISOString().split("T")[0];

    const bookings = await Booking.findAll({
      where: {
        booking_date: { [Op.lte]: today },
        end_date: { [Op.gte]: today },
      },
      include: [
        { model: Room, attributes: ["room_number"] },
        { model: Course, attributes: ["course_name"] },
      ],
      order: [["start_time", "ASC"]],
    });

    res.locals.bookings = bookings;
    next();
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).send("Error fetching bookings");
  }
};
