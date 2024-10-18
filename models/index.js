// models/index.js
const { sequelize } = require("../config/db");
const { User } = require("./user");
const { Role } = require("./role");

// Set up associations
User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(User, { foreignKey: "role_id" });

module.exports = {
  User,
  Role,
  sequelize,
};
