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


Room.findAvailableRooms = async function(date, endDate, startTime, endTime, courseId) {
    const startDateTime = new Date(date + ' ' + startTime);
    const endDateTime = new Date(endDate + ' ' + endTime);

    return await Room.findAll({
        where: {
            [Op.or]: [
                { room_status: { [Op.ne]: 'unavailable' } }, // Exclude rooms that are explicitly marked as 'unavailable'
                { room_status: { [Op.is]: null } } // Include rooms where the status is NULL
            ]
        },
        include: [{
            model: Booking,
            as: 'Bookings',
            required: false,
            where: {
                [Op.or]: [
                    { start_time: { [Op.gte]: endDateTime } },  // Bookings start after the desired end time
                    { end_time: { [Op.lte]: startDateTime } }   // Bookings end before the desired start time
                ],
                course_id: courseId
            },
            attributes: []
        }],
        logging: console.log // This will log the SQL query to your console
    });
};

module.exports = {Room};