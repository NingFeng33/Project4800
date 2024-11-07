const { sequelize } = require("../config/db");
const Sequelize = require("sequelize");

const Booking = require("./booking");
const User = require("./user");
const Role = require("./role");
const Room = require("./room");
const Course = require("./course");
const Program = require("./program");
const RoomBooking = require("./room_booking");
const Notification = require("./notification");
const NotificationUser = require("./notification_user");
const NotificationTemplate = require("./notification_template");

// Initialize associations
User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(User, { foreignKey: "role_id" });

Notification.belongsTo(NotificationTemplate, { foreignKey: "template_id" });
NotificationTemplate.hasMany(Notification, { foreignKey: "template_id" });

// Many-to-Many between Notification and User via NotificationUser
Notification.belongsToMany(User, {
  through: NotificationUser,
  foreignKey: "notification_id",
});
User.belongsToMany(Notification, {
  through: NotificationUser,
  foreignKey: "user_id",
});
// Room.hasMany(RoomBooking, { foreignKey: "room_id" });
RoomBooking.belongsTo(Room, { foreignKey: "room_id" });
Course.belongsTo(Program, { foreignKey: "program_id" });
Program.hasMany(Course, { foreignKey: "program_id" });

Room.hasMany(Booking, {
  foreignKey: "room_id", // ensure this is the correct foreign key field in your Booking model
  as: "Bookings", // This alias is important for your query to work
});

module.exports = {
  sequelize,
  Sequelize,
  User,
  Role,
  Room,
  RoomBooking,
  Notification,
  NotificationTemplate,
};
