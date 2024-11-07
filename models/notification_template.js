// models/NotificationTemplate.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const NotificationTemplate = sequelize.define(
  "NotificationTemplate",
  {
    template_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    template_message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: DataTypes.STRING,
  },
  {
    tableName: "NotificationTemplates",
    timestamps: false,
  }
);

module.exports = NotificationTemplate;
