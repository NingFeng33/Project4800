const express = require("express");
const {
  checkRoomAvailability,
  bookRoom,
} = require("../controllers/bookingController");
const { isAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

// Render the booking page
router.get("/admin/booking/:user_id", isAuthenticated, (req, res) => {
  res.render("booking");
});

// API to check room availability
router.post(
  "/admin/booking/check-availability",
  isAuthenticated,
  checkRoomAvailability
);
//router.post('/booking/check-availability', checkRoomAvailability);
// API to book a room
router.post("/admin/booking/book-room", isAuthenticated, bookRoom);

module.exports = router;
