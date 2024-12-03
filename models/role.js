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
      type: DataTypes.STRING(255),
      allowNull: true,  
    },
  },
  {
    timestamps: false,
    tableName: "Roles", 
  }
);

module.exports =  Role;  