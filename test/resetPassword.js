const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const { Role } = require("../models/role");
const { sequelize } = require("../config/db");

async function resetPassword() {
  try {
    // Sync the database
    await sequelize.sync();
  } catch (e) {
    console.error("Error creating test users:", error);
    process.exit(1);
  }
}
