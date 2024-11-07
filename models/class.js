const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Class = sequelize.define(
  "Class",
  {
    class_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    class_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "Class",
    timestamps: false,
  }
);

module.exports = Class;
