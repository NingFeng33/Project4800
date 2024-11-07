// models/NotificationUser.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const NotificationUser = sequelize.define(
  "NotificationUser",
  {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "Notifications",
        key: "notification_id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "User",
        key: "user_id",
      },
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "NotificationUsers",
    timestamps: false,
  }
);

module.exports = NotificationUser;
