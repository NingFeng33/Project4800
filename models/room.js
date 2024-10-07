const {DataTypes} = require('sequelize');
const {sequelize} = require('../config/db');

const Room = sequelize.define(
    'Room',
    {
        room_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        room_status: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        room_number: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        room_capacity: {
            type: DataTypes.STRING(255),
            allowNull: false
        }
    },
    {
        tableName: 'Room',
        timestamps: false
    }
);

// Define a custom method on the Room model
Room.findAvailableRooms = async function(date, startTime, endTime, courseId) {
    const queryDate = new Date(date);
    const startDateTime = new Date(date + ' ' + startTime);
    const endDateTime = new Date(date + ' ' + endTime);

    return await Room.findAll({
        where: {
            room_status: 'available',  // Assume you have a status field or similar
            [Op.not]: [
                // Exclude rooms that have bookings which overlap with the requested time
                {
                    '$Bookings.start_time$': {[Op.lt]: endDateTime},
                    '$Bookings.end_time$': {[Op.gt]: startDateTime}
                }
            ]
        },
        include: [{
            model: Booking,
            required: false,
            attributes: [],
            where: {
                course_id: courseId,  
                [Op.or]: [
                    {
                        start_time: {[Op.lt]: endDateTime},
                        end_time: {[Op.gt]: startDateTime}
                    }
                ]
            }
        }]
    });
};

module.exports = {Room};