const express = require("express");
const {
  renderBookingPage,
  getAllBookings,
  checkRoomAvailability,
  bookRoom,
} = require("../controllers/booking");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

// Render booking page (restricted to authenticated users)
router.get("/", isAuthenticated, isAdmin, renderBookingPage);

// API to check room availability
router.post(
  "/check-availability",
  isAuthenticated,
  isAdmin,
  checkRoomAvailability
);

// API to book a room
router.post("/book-room", isAuthenticated, isAdmin, bookRoom);

// Render booking page (restricted to Faculty and Admin roles)
router.get("/:user_id", isAuthenticated, renderBookingPage);

// // Create an API endpoint to fetch bookings.
router.get("/all", isAuthenticated, getAllBookings);

// routes/bookingRoutes.js
router.post("/update", isAdmin, async (req, res) => {
  const { bookingId, startTime, endTime } = req.body;

  try {
    const booking = await Booking.findByPk(bookingId);

    // Check for conflicts before updating
    const conflict = await Booking.findOne({
      where: {
        room_id: booking.room_id,
        book_id: { [Op.ne]: bookingId },
        [Op.or]: [
          {
            start_time: { [Op.lt]: endTime, [Op.gt]: startTime },
          },
          {
            end_time: { [Op.gt]: startTime, [Op.lt]: endTime },
          },
        ],
      },
    });

    if (conflict) {
      return res
        .status(409)
        .json({ success: false, message: "Booking conflict detected." });
    }

    booking.start_time = startTime;
    booking.end_time = endTime;
    await booking.save();

    // Notify affected users
    await notifyStaffBooking(booking.course_id, {
      course_name: booking.Course.course_name,
      room_number: booking.Room.room_number,
      capacity: booking.Course.size,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating booking:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update booking" });
  }
});

module.exports = router;
