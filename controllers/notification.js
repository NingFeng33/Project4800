const Notification = require("../models/notification");
const User = require("../models/user");

// Renders the notifications page for the user.
exports.renderNotificationsPage = async (req, res) => {
  const userId = req.session.user.user_id;

  try {
    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    res.render("notifications", { user: req.session.user, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).send("Error fetching notifications");
  }
};

// Retrieves notifications for the current user.
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.session.user.user_id;

    const notifications = await Notification.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]],
    });

    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching notifications" });
  }
};

//Marks a notification as read for the current user.
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.session.user.user_id;

    // Update the notification to mark it as read
    await Notification.update(
      { is_read: true },
      {
        where: {
          notification_id: notificationId,
          user_id: userId,
        },
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res
      .status(500)
      .json({ success: false, message: "Error marking notification as read" });
  }
};

// Creates a notification and associates it with a user.
exports.createNotification = async (userId, message, redirectUrl = null) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      message,
      redirect_url: redirectUrl,
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Sends a notification to all users and emits it via Socket.IO.
exports.sendNotificationToAll = (io, message, url) => {
  console.log("Emitting notification to all users");
  io.emit("notification", { message, url });
};
