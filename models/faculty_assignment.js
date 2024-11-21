const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const FacultyAssignment = sequelize.define(
  "Faculty_Assignment",
  {
    assignment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Room_Booking",
        key: "book_id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "user_id",
      },
    },
  },
  {
    tableName: "Faculty_Assignment",
    timestamps: false,
  }
);

module.exports = FacultyAssignment;
