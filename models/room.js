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


Room.findAvailableRooms = async function(date, startTime, endTime, courseId) {
    const queryDate = new Date(date);
    const startDateTime = new Date(date + ' ' + startTime);
    const endDateTime = new Date(date + ' ' + endTime);

    return await Room.findAll({
        where: {
            room_status: 'available',
            [Op.not]: [
                {
                    '$Bookings.start_time$': {[Op.lt]: endDateTime},
                    '$Bookings.end_time$': {[Op.gt]: startDateTime}
                }
            ]
        },
        include: [{
            model: Booking,
            as: 'Bookings',  // Use the alias defined in the association
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