const express = require("express");
const router = express.Router();
const {
  renderNotificationsPage,
  getNotifications,
  markNotificationAsRead,
} = require("../controllers/notification");
const { isAuthenticated } = require("../middleware/auth");

router.get("/view", isAuthenticated, renderNotificationsPage);
router.get("/", isAuthenticated, getNotifications);
router.post("/:id/read", isAuthenticated, markNotificationAsRead);

module.exports = router;
