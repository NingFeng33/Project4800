const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Room = sequelize.define('Room', {
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
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'Room',
    timestamps: false
});

// findAvailableRooms
Room.findAvailableRooms = async function (date, endDate, startTime, endTime, courseId) {
    try {
        const query = `
            SELECT * FROM Room
            WHERE room_id NOT IN (
                SELECT room_id FROM Room_Booking
                WHERE 
                    ((start_time <= :end AND end_time >= :start) OR
                     (start_time <= :endDate AND end_time >= :startDate)) 
                    AND booking_status = 'booked'
            )
        `;

        const availableRooms = await sequelize.query(query, {
            replacements: {
                start: `${date} ${startTime}:00`,
                end: `${date} ${endTime}:00`,
                startDate: `${endDate} ${startTime}:00`,
                endDate: `${endDate} ${endTime}:00`
            },
            type: sequelize.QueryTypes.SELECT
        });

        return availableRooms;
    } catch (error) {
        console.error("Error in findAvailableRooms:", error);
        throw error;
    }
};

module.exports = Room;
