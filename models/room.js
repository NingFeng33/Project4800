
const {DataTypes, Op, Sequelize} = require('sequelize');
const {sequelize} = require('../config/db');
const { Booking } = require('./booking');  

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
        capacity: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        tableName: 'Room',
        timestamps: false
    }
);


Room.findAvailableRooms = async function(startDate, endDate, startTime, endTime, courseId) {
    const formattedStartDate = new Date(startDate).toISOString().slice(0, 10);
    const formattedEndDate = new Date(endDate).toISOString().slice(0, 10);

    console.log("Checking availability from:", formattedStartDate, startTime, "to:", formattedEndDate, endTime);

    const dates = [];
    let currentDate = new Date(formattedStartDate);
    while (currentDate <= new Date(formattedEndDate)) {
        dates.push(currentDate.toISOString().slice(0, 10));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    console.log("Checking days:", dates);

    const availableRoomsPerDay = await Promise.all(dates.map(async (date) => {
        // Parse the date and start time to a Date object
        let startDateTime = new Date(`${date}T${startTime}:00Z`);
        // Adjust for the 5-hour difference
        startDateTime.setHours(startDateTime.getHours() + 8);
        
        // Parse the date and end time to a Date object
        let endDateTime = new Date(`${date}T${endTime}:00Z`);
        // Adjust for the 5-hour difference
        endDateTime.setHours(endDateTime.getHours() + 8);

        // Format back to string for SQL query
        const dailyStartDateTime = startDateTime.toISOString().slice(0, 19).replace('T', ' ');
        const dailyEndDateTime = endDateTime.toISOString().slice(0, 19).replace('T', ' ');

        console.log("Adjusted Checking availability for:", dailyStartDateTime, "to", dailyEndDateTime);
        let additionalCondition = '';
        if (courseId) {
            additionalCondition = `AND Room.capacity >= (SELECT size FROM Courses WHERE course_id = '${courseId}')`;
        }
        const query = `
            SELECT Room.room_id, Room.capacity, Room.room_number
            FROM Room
            WHERE Room.room_id NOT IN (
                SELECT Bookings.room_id
                FROM Room_Booking AS Bookings
                WHERE (
                    Bookings.booking_date <= '${date}' AND
                    Bookings.end_date >= '${date}'
                ) AND (
                    NOT (Bookings.end_time <= '${dailyStartDateTime}' OR
                    Bookings.start_time >= '${dailyEndDateTime}')
                )
            )
			${additionalCondition}
            ORDER BY Room.room_number;
        `;
        return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
    }));

    const availableRooms = availableRoomsPerDay.reduce((acc, rooms, index) => {
        if (index === 0) {
            return rooms;
        }
        return acc.filter(room => rooms.some(r => r.room_id === room.room_id));
    }, availableRoomsPerDay[0]);

    console.log("Consistently available rooms across all dates:", availableRooms);
    return availableRooms;
};


module.exports = Room;
