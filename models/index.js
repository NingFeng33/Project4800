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

// Initialize associations
User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(User, { foreignKey: "role_id" });

User.hasMany(Notification, { foreignKey: "user_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });

Booking.belongsTo(Room, { foreignKey: "room_id" });
Room.hasMany(Booking, {
  foreignKey: "room_id", // ensure this is the correct foreign key field in your Booking model
  as: "Bookings", // This alias is important for your query to work
});

Booking.belongsTo(Course, { foreignKey: "course_id" });
Course.hasMany(Booking, { foreignKey: "course_id" });
Booking.belongsTo(Room, { foreignKey: "room_id" });
// RoomBooking.belongsTo(Room, { foreignKey: "room_id" });
Course.belongsTo(Program, { foreignKey: "program_id" });
Program.hasMany(Course, { foreignKey: "program_id" });

module.exports = {
  sequelize,
  Sequelize,
  User,
  Role,
  Room,
  RoomBooking,
  Notification,
};
