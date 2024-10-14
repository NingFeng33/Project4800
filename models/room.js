
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


Room.hasMany(Booking, {
    foreignKey: 'room_id',  // ensure this is the correct foreign key field in your Booking model
    as: 'Bookings'  // This alias is important for your query to work
});


// Room.findAvailableRooms = async function(date, endDate, startTime, endTime, courseId) {
//     // Create date strings directly
//     const startDateTime = new Date(`${date}T${startTime}:00Z`); // 创建 UTC 时间
//     const endDateTime = new Date(`${endDate}T${endTime}:00Z`);

//     console.log("Checking availability from:", startDateTime, "to:", endDateTime);

//     return await Room.findAll({
//         where: {
//             [Op.or]: [
//                 { room_status: { [Op.ne]: 'unavailable' } },
//                 { room_status: { [Op.is]: null } }
//             ]
//         },
//         include: [{
//             model: Booking,
//             as: 'Bookings',
//             required: false,
//             where: {
//                 [Op.not]: [ // 确保没有时间重叠
//                     {
//                         [Op.or]: [
//                             { start_time: { [Op.lte]: endDateTime }, end_time: { [Op.gte]: startDateTime } }, // Covers cases where existing bookings envelop the new booking
//                             { start_time: { [Op.between]: [startDateTime, endDateTime] } }, // Covers cases where existing bookings start within the new booking
//                             { end_time: { [Op.between]: [startDateTime, endDateTime] } } // Covers cases where existing bookings end within the new booking
//                         ]
//                     }
//                 ],
//                 course_id: courseId
//             },
//             attributes: []
//         }],
//         logging: console.log
//     });
// }
// Room.findAvailableRooms = async function(date, endDate, startTime, endTime, courseId) {
//     const startDateTime = new Date(`${date}T${startTime}:00Z`).toISOString(); // Create UTC time
//     const endDateTime = new Date(`${endDate}T${endTime}:00Z`).toISOString();

//     console.log("Checking availability from:", startDateTime, "to:", endDateTime);

//     return await Room.findAll({
//         where: {
//             [Op.or]: [
//                 { room_status: { [Op.ne]: 'unavailable' } },
//                 { room_status: { [Op.is]: null } }
//             ]
//         },
//         include: [{
//             model: Booking,
//             as: 'Bookings',
//             required: false,
//             where: {
//                 [Op.not]: {
//                     [Op.or]: [
//                         {
//                             [Op.and]: [
//                                 { start_time: { [Op.lte]: endDateTime } },
//                                 { end_time: { [Op.gte]: startDateTime } }
//                             ]
//                         }
//                     ]
//                 },
//                 //course_id: courseId
//             },
//             attributes: []
//         }],
//         logging: console.log
//     });
// };
Room.findAvailableRooms = async function(date, endDate, startTime, endTime, courseId) {
    // Format the start and end times to be used in the raw SQL query
    const startDateTime = `${date} ${startTime}:00`;
    const endDateTime = `${endDate} ${endTime}:00`;

    console.log("Checking availability from:", startDateTime, "to:", endDateTime);

    // Use sequelize.query to execute a raw SQL query
    const results = await sequelize.query(`
        SELECT Room.room_id, Room.room_status, Room.room_number, Room.capacity
        FROM Room
        LEFT JOIN Room_Booking AS Bookings
            ON Room.room_id = Bookings.room_id
            AND (
                Bookings.start_time < '${endDateTime}'
                AND Bookings.end_time > '${startDateTime}'
            )
        WHERE (Room.room_status != 'unavailable' OR Room.room_status IS NULL)
            AND Bookings.room_id IS NULL
        GROUP BY Room.room_id
        HAVING COUNT(Bookings.room_id) = 0
    `, { type: sequelize.QueryTypes.SELECT });

    return results;
};
module.exports = { Room };