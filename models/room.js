
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

// Room.findAvailableRooms = async function(startDate, endDate, startTime, endTime, courseId) {

//     const formattedStartDate = new Date(startDate + 'T' + startTime + ':00').toISOString().slice(0, 10);
//     const formattedEndDate = new Date(endDate + 'T' + endTime + ':00').toISOString().slice(0, 10);

//     console.log("Checking availability from:", formattedStartDate, startTime, "to:", formattedEndDate, endTime);

//     const dates = [];
//     let currentDate = new Date(formattedStartDate);
//     while (currentDate <= new Date(formattedEndDate)) {
//         dates.push(currentDate.toISOString().slice(0, 10));
//         currentDate.setDate(currentDate.getDate() + 1);
//     }
//     console.log("checking days:", dates);

//     const availableRoomsPerDay = await Promise.all(dates.map(async (date) => {
//         const dailyStartDateTime = `${date} ${startTime}:00`;
//         const dailyEndDateTime = `${date} ${endTime}:00`;
//         console.log("dailyStartDateTime is: ", dailyStartDateTime);
//         console.log("dailyEndDateTime is: ", dailyEndDateTime);

//         const query = `
//             SELECT Room.room_id, Room.room_status, Room.room_number, Room.capacity
//             FROM Room
//             LEFT JOIN Room_Booking AS Bookings ON Room.room_id = Bookings.room_id
//             WHERE Room.room_status != 'unavailable'
//                 AND (Bookings.room_id IS NULL OR NOT (
//                     (Bookings.start_time < '${dailyEndDateTime}' AND Bookings.end_time > '${dailyStartDateTime}')
//                 ))
//             GROUP BY Room.room_id
//             HAVING COUNT(Bookings.room_id) = 0;
//         `;

//         return sequelize.query(query, { type: sequelize.QueryTypes.SELECT });
//     }));

//     const availableRooms = availableRoomsPerDay.reduce((acc, rooms, index) => {
//         if (index === 0) {
//             return rooms;
//         }
//         return acc.filter(room => rooms.some(r => r.room_id === room.room_id));
//     }, availableRoomsPerDay[0]);

//     return availableRooms;
// };
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
        const dailyStartDateTime = `${date} ${startTime}:00`;
        const dailyEndDateTime = `${date} ${endTime}:00`;
        console.log("Checking availability for:", dailyStartDateTime, "to", dailyEndDateTime);

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
                    Bookings.start_time < '${dailyEndDateTime}' AND
                    Bookings.end_time > '${dailyStartDateTime}'
                )
            )
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