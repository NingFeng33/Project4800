const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Faculty = sequelize.define(
  "Faculty",
  {
    faculty_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    faculty_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "Faculty",
    timestamps: false,
  }
);

module.exports = { Faculty };
