const { sequelize } = require("../config/db");
const { DataTypes } = require("sequelize");

const Notification = sequelize.define(
  "Notification",
  {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "user_id",
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      // e.g., 'info', 'warning', 'success', 'error'
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "info",
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Notifications",
    timestamps: false,
  }
);

module.exports = Notification;
