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
    const startDateTime = new Date(`${date}T${startTime}:00Z`).toISOString(); // Create UTC time
    const endDateTime = new Date(`${endDate}T${endTime}:00Z`).toISOString();

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
                [Op.not]: {
                    [Op.or]: [
                        {
                            [Op.and]: [
                                { start_time: { [Op.lte]: endDateTime } },
                                { end_time: { [Op.gte]: startDateTime } }
                            ]
                        }
                    ]
                },
                //course_id: courseId
            },
            attributes: []
        }],
        logging: console.log
    });
};
module.exports = { Room };