const Booking = require("../models/booking");
const Room = require("../models/room");
const Course = require("../models/course");
const Notification = require("../models/notification");
const { Op } = require("sequelize");

exports.renderDashboard = async (req, res) => {
  try {
    const userId = req.session.user.user_id;

    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Fetch bookings for the current user and today's date
    const bookings = await Booking.findAll({
      where: {
        booking_date: {
          [Op.lte]: today,
        },
        end_date: {
          [Op.gte]: today,
        },
      },
      include: [
        {
          model: Room,
          attributes: ["room_number"],
        },
        {
          model: Course,
          attributes: ["course_name"],
        },
      ],
      order: [["start_time", "ASC"]],
    });

    // Fetch recent notifications
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
      limit: 5, // Adjust as needed
    });

    // Pass data to the dashboard EJS template
    res.render("dashboard", {
      user: req.session.user,
      bookings,
      notifications,
    });
  } catch (error) {
    console.error("Error rendering dashboard:", error);
    res.status(500).send("Error rendering dashboard");
  }
};
