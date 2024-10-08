const {DataTypes} = require("sequelize");
const {sequelize} = require("../config/db");

const Booking = sequelize.define(
    "Booking",
    {
        booking_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        booking_status: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        room_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Room",
                key: "room_id"
            }
        },
        course_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Course",
                key: "course_id"
            }
        },
        start_time: {
            type: DataTypes.TIME,
            allowNull: true
        },
        end_time: {
            type: DataTypes.TIME,
            allowNull: true
        },
        booking_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        booking_duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    },
    {
        tableName: "Room_Booking",
        timestamps: false
    }
);



module.exports = {Booking};