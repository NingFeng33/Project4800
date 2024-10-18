const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Role = sequelize.define(
  "Role",
  {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    role_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    role_description: {
      type: DataTypes.STRING(255), // Adjust size as necessary
      allowNull: true, // Allowing null if it's not always required
    },
  },
  {
    timestamps: false,
    tableName: "Roles", // Specify table name if different from model name
  }
);

module.exports = { Role }; // Exporting as Role
