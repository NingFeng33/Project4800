const { sequelize } = require('../config/db');
const { Course } = require('../models/course');
const { Booking } = require('../models/booking');
const { Room } = require('../models/room');
const { Program } = require('../models/program'); 

// Define associations
Course.hasMany(Booking, { foreignKey: 'course_id' });
Booking.belongsTo(Course, { foreignKey: 'course_id' });

Room.hasMany(Booking, { foreignKey: 'room_id' });
Booking.belongsTo(Room, { foreignKey: 'room_id' });

Course.belongsTo(Program, { foreignKey: 'program_id' });

module.exports = { sequelize, Course, Booking, Room };
