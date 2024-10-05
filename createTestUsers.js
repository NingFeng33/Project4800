const bcrypt = require("bcrypt");
const { User } = require("./models/user");
const { sequelize } = require("./config/db");

async function createTestUsers() {
  try {
    await sequelize.sync();

    const adminPassword = "AdminPass123";
    const staffPassword = "StaffPass123";

    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash(adminPassword, saltRounds);
    const staffPasswordHash = await bcrypt.hash(staffPassword, saltRounds);

    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { email: "admin@example.com" },
      defaults: {
        first_name: "Admin",
        last_name: "User",
        email: "admin@example.com",
        password_hash: adminPasswordHash,
        role: "Admin",
      },
    });

    if (adminCreated) {
      console.log("Admin user created:", adminUser.email);
    } else {
      console.log("Admin user already exists:", adminUser.email);
    }

    const [staffUser, staffCreated] = await User.findOrCreate({
      where: { email: "staff@example.com" },
      defaults: {
        first_name: "Staff",
        last_name: "User",
        email: "staff@example.com",
        password_hash: staffPasswordHash,
        role: "Faculty",
      },
    });

    if (staffCreated) {
      console.log("Staff user created:", staffUser.email);
    } else {
      console.log("Staff user already exists:", staffUser.email);
    }

    process.exit();
  } catch (error) {
    console.error("Error creating test users:", error);
    process.exit(1);
  }
}

createTestUsers();
