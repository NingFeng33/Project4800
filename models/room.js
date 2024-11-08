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

module.exports = Room;
