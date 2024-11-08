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

Room.findAvailableRooms = async function(date, endDate, startTime, endTime, courseId) {
    // Format the start and end times to be used in the raw SQL query
    const startDateTime = `${date} ${startTime}:00`;
    const endDateTime = `${endDate} ${endTime}:00`;

    console.log("Checking availability from:", startDateTime, "to:", endDateTime);

    // Use sequelize.query to execute a raw SQL query
    const results = await sequelize.query(`
        SELECT Room.room_id, Room.room_status, Room.room_number, Room.capacity
        FROM Room
        LEFT JOIN Room_Booking AS Bookings ON Room.room_id = Bookings.room_id
        LEFT JOIN Courses AS Course ON Bookings.course_id = Course.course_id
        WHERE (Room.room_status != 'unavailable' OR Room.room_status IS NULL)
            AND (Bookings.room_id IS NULL OR (
                Bookings.start_time >= '${endDateTime}' 
                OR Bookings.end_time <= '${startDateTime}'
                AND Course.course_id != '${courseId}' 
            ))
            AND Room.capacity >= (SELECT size FROM Courses WHERE course_id = '${courseId}')
        GROUP BY Room.room_id
        HAVING COUNT(Bookings.room_id) = 0
    `, { type: sequelize.QueryTypes.SELECT });

    return results;
};

module.exports = Room;
