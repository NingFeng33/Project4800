const { zonedTimeToUtc } = require('date-fns-tz');
const {DataTypes, Op} = require('sequelize');
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
//     const startDateTime = `${date} ${startTime}:00`;
//     const endDateTime = `${endDate} ${endTime}:00`;

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
//                 [Op.and]: [
//                     { start_time: { [Op.lt]: endDateTime } },
//                     { end_time: { [Op.gt]: startDateTime } }
//                 ],
//                 course_id: courseId
//             },
//             attributes: []
//         }],
//         logging: console.log
//     });
// };
Room.findAvailableRooms = async function(date, endDate, startTime, endTime, courseId) {
    const timeZone = 'America/Vancouver'; // 你的本地时区

    // 将本地时间转换为 UTC
    const startDateTime = zonedTimeToUtc(`${date}T${startTime}:00`, timeZone);
    const endDateTime = zonedTimeToUtc(`${endDate}T${endTime}:00`, timeZone);

    console.log("Checking availability from:", startDateTime, "to:", endDateTime);

    return await Room.findAll({
        where: {
            [Op.or]: [
                { room_status: { [Op.ne]: 'unavailable' } },
                { room_status: { [Op.is]: null } }
            ]
        },
        include: [{
            model: Booking,
            as: 'Bookings',
            required: false,
            where: {
                [Op.and]: [
                    { start_time: { [Op.lt]: endDateTime } },
                    { end_time: { [Op.gt]: startDateTime } }
                ],
                course_id: courseId
            },
            attributes: []
        }],
        logging: console.log
    });
};

module.exports = { Room };