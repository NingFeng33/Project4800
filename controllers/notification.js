const Notification = require("../models/notification");
const NotificationTemplate = require("../models/notification_template");
const NotificationUser = require("../models/notification_user");
const User = require("../models/user");
const Role = require("../models/role");

exports.renderNotificationsPage = (_, res) => {
  res.render("notifications");
};

exports.getNotifications = async (req, res) => {
  const userId = req.session.user.user_id;

  const notifications = await Notification.findAll({
    include: [
      {
        model: NotificationUser,
        where: { user_id: userId },
        attributes: ["is_read"],
      },
      {
        model: NotificationTemplate,
        attributes: ["template_message"],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Render messages with parameters
  const notificationList = notifications.map((notif) => {
    const template = notif.NotificationTemplate.template_message;
    const parameters = notif.parameters;
    const is_read = notif.NotificationUsers[0].is_read;
    const message = renderTemplate(template, parameters);

    return {
      notification_id: notif.notification_id,
      message,
      is_read,
      created_at: notif.created_at,
    };
  });

  res.json(notificationList);
};

exports.markNotificationAsRead = async (req, res) => {
  const userId = req.session.user.user_id;
  const notificationId = req.params.id;

  await NotificationUser.update(
    { is_read: true },
    {
      where: {
        notification_id: notificationId,
        user_id: userId,
      },
    }
  );

  res.json({ success: true });
};

// Function to render template messages with parameters
function renderTemplate(template, parameters) {
  return template.replace(/\{(\w+)\}/g, (_, key) => parameters[key] || "");
}

// Create a notification in the database and associate it with users
async function createNotification(templateType, parameters, recipientUserIds) {
  const template = await NotificationTemplate.findOne({
    where: { notification_type: templateType },
  });

  if (!template) {
    throw new Error("Notification template not found");
  }

  const notification = await Notification.create({
    template_id: template.template_id,
    parameters,
  });

  // Associate notification with users
  const notificationUsers = recipientUserIds.map((user_id) => ({
    notification_id: notification.notification_id,
    user_id,
    is_read: false,
  }));

  await NotificationUser.bulkCreate(notificationUsers);

  return notification;
}

// Notify staff about a booking update, and send to admins as well
exports.notifyStaffBooking = async (userId, bookingDetails, io) => {
  const user = await User.findByPk(userId);
  const userName = `${user.F_Name} ${user.L_Name}`;

  const parameters = {
    user_name: userName,
    course_name: bookingDetails.course_name,
    room_number: bookingDetails.room_number,
    capacity: bookingDetails.capacity,
  };

  const admins = await User.findAll({
    include: [{ model: Role, where: { role_name: "Admin" } }],
  });
  const adminIds = admins.map((admin) => admin.user_id);
  const recipientUserIds = [userId, ...adminIds];

  const notification = await createNotification(
    "staffBooking",
    parameters,
    recipientUserIds
  );

  const message = renderTemplate(
    "Booking for course {course_name} has been made in room {room_number} with capacity {capacity}.",
    parameters
  );

  recipientUserIds.forEach((userId) => {
    io.to(`user_${userId}`).emit("notification", {
      message,
      redirectUrl: "/calendar",
    });
  });
};

// Notify admins about a room conflict
exports.notifyBookingConflict = async (conflictDetails, io) => {
  const parameters = {
    room_number: conflictDetails.room_number,
    start_time: conflictDetails.start_time,
    end_time: conflictDetails.end_time,
  };

  const admins = await User.findAll({
    include: [{ model: Role, where: { role_name: "Admin" } }],
  });
  const adminIds = admins.map((admin) => admin.user_id);

  await createNotification("bookingConflict", parameters, adminIds);

  const message = renderTemplate(
    "Conflict detected for room {room_number}.",
    parameters
  );

  adminIds.forEach((adminId) => {
    io.to(`user_${adminId}`).emit("notification", {
      message,
      redirectUrl: "/admin/resolve-conflicts",
    });
  });
};
