const bcrypt = require("bcrypt");
const { User } = require("../models/user");
const { Role } = require("../models/role");
const { sequelize } = require("../config/db");

async function createTestUsers() {
  try {
    // Sync the database
    await sequelize.sync();

    const adminPassword = "AdminPass123";
    const staffPassword = "StaffPass123";

    // Hash passwords
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash(adminPassword, saltRounds);
    const staffPasswordHash = await bcrypt.hash(staffPassword, saltRounds);

    // Create or find Admin role
    const [adminRole] = await Role.findOrCreate({
      where: { role_name: "Admin" },
      defaults: {
        role_description: "Administrator",
      },
    });

    // Create or find Faculty role
    const [facultyRole] = await Role.findOrCreate({
      where: { role_name: "Faculty" },
      defaults: {
        role_description: "Faculty member",
      },
    });

    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { email: "admin@example.com" },
      defaults: {
        F_Name: "Admin",
        L_Name: "User",
        role_id: adminRole.role_id,
        email: "admin@example.com",
        password: adminPasswordHash,
      },
    });

    if (adminCreated) {
      console.log("Admin user created:", adminUser.email);
    } else {
      console.log("Admin user already exists:", adminUser.email);
    }

    const [facultyUser, facultyCreated] = await User.findOrCreate({
      where: { email: "staff@example.com" },
      defaults: {
        F_Name: "Staff",
        L_Name: "User",
        role_id: facultyRole.role_id,
        email: "staff@example.com",
        password: staffPasswordHash,
      },
    });

    if (facultyCreated) {
      console.log("Staff user created:", facultyUser.email);
    } else {
      console.log("Staff user already exists:", facultyUser.email);
    }

    process.exit();
  } catch (error) {
    console.error("Error creating test users:", error);
    process.exit(1);
  }
}

createTestUsers();
