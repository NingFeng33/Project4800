const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Room = require("./room");

const RoomRental = sequelize.define("RoomRental", {
  rental_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  renter_name: {
    type: DataTypes.STRING(255),
  },
  start_time: {
    type: DataTypes.DATE,
  },
  end_time: {
    type: DataTypes.DATE,
  },
  purpose: {
    type: DataTypes.TEXT,
  },
  room_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Room,
      key: "room_id",
    },
  },
});

module.exports = RoomRental;
