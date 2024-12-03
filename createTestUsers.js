const bcrypt = require("bcrypt");
const { User, Role, sequelize } = require("./models"); // Import Role model

async function createTestUsers() {
  try {
    // Sync database
    await sequelize.sync();

    // Define test user data
    const users = [
      {
        F_Name: "Admin",
        L_Name: "User",
        email: "admin@bcit.ca",
        role_name: "Admin",
        password: "123",
      },
      {
        F_Name: "Staff",
        L_Name: "User",
        email: "staff@bcit.ca",
        role_name: "Faculty",
        password: "123",
      },
    ];

    for (const userData of users) {
      const { F_Name, L_Name, email, role_name, password } = userData;

      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Find the role
      const role = await Role.findOne({ where: { role_name } });
      if (!role) {
        console.error(`Role "${role_name}" not found. Skipping user creation for ${email}.`);
        continue;
      }

      // Find or create the user
      const [user, created] = await User.findOrCreate({
        where: { email },
        defaults: {
          F_Name,
          L_Name,
          email,
          role_id: role.role_id,
          password: hashedPassword,
        },
      });

      if (created) {
        console.log(`User "${email}" created successfully.`);
      } else {
        console.log(`User "${email}" already exists.`);
      }
    }

    process.exit();
  } catch (error) {
    console.error("Error creating test users:", error);
    process.exit(1);
  }
}

createTestUsers();

