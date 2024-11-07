const { NotificationTemplate } = require("../../models/notification_template");

async function seedNotificationTemplates() {
  await NotificationTemplate.bulkCreate([
    {
      template_message:
        "Admin has made a booking for {course_name} in room {room_number}.",
      description: "Staff Booking Notification",
      notification_type: "staffBooking",
    },
    {
      template_message:
        "Booking conflict detected for room {room_number} between {start_time} and {end_time}.",
      description: "Booking Conflict Notification",
      notification_type: "bookingConflict",
    },
  ]);
}

seedNotificationTemplates();
