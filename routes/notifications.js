const express = require("express");
const router = express.Router();
const {
  Notification,
  NotificationUser,
  NotificationTemplate,
} = require("../models");

const { isAuthenticated } = require("../middleware/auth");

router.get("/view", isAuthenticated, (_, res) => {
  res.render("notifications");
});

router.get("/", isAuthenticated, async (req, res) => {
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
});

router.post("/:id/read", isAuthenticated, async (req, res) => {
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
});

function renderTemplate(template, parameters) {
  return template.replace(/\{(\w+)\}/g, (_, key) => parameters[key] || "");
}

module.exports = router;
