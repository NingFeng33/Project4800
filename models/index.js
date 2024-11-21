const { sequelize } = require('../config/db');
const User = require('./user');
const Role = require('./role');
const Room = require('./room');
const Course = require('./course');
const Booking = require('./booking');
const Program = require('./program');
const RoomRental = require('./room_rental')

// Define associations
User.belongsTo(Role, { foreignKey: 'role_id' });
Role.hasMany(User, { foreignKey: 'role_id' });

Room.hasMany(Booking, { foreignKey: 'room_id', as: 'Bookings' });
Booking.belongsTo(Room, { foreignKey: 'room_id' });

Course.hasMany(Booking, { foreignKey: 'course_id', as: 'Bookings' });
Booking.belongsTo(Course, { foreignKey: 'course_id' });

Program.hasMany(Course, { foreignKey: 'program_id', as: 'Courses' });
Course.belongsTo(Program, { foreignKey: 'program_id',  as: 'Program' });

RoomRental.belongsTo(Room, {foreignKey: 'room_id'});
Room.hasMany(RoomRental, {foreignKey: 'rental_id'})

module.exports = {
  User,
  Role,
  Room,
  Course,
  Booking,
  Program,
  RoomRental,
  sequelize
};