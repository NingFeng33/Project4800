const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");


const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    F_Name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    L_Name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Roles', 
        key: 'role_id', 
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    tableName: 'User',
    timestamps: false
  }
);

module.exports = { User };
