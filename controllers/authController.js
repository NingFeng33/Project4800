
const { User} = require("../models/user");
const { Role } = require("../models/role");
//const sequelize = require("../config/db");
const bcrypt = require("bcrypt");


// Login
exports.getLogin = (_req, res) => {
  res.render("login", { message: "" });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Role,
        attributes: ['role_name']
      }]
    });

    if (!user) {
      return res.render("login", { message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render("login", { message: "Invalid email or password." });
    }

    // Assume the Role model is correctly defined and linked
    const roleName = user.Role.role_name;  // Adjust according to actual model linkage

    req.session.userId = user.user_id;
    req.session.role = roleName;  // Store the role name for easier checks

    req.session.save(() => {
      switch(roleName) {
        case 'Admin':
          res.redirect("/admin/dashboard");
          break;
        case 'Faculty':
          res.redirect("/faculty/dashboard");
          break;
        default:
          res.redirect("/dashboard");
      }
    });
  } catch (error) {
    console.error(error);
    res.render("login", {
      message: "An error occurred. Please try again."
    });
  }
};

// Sign up
exports.getSignup = (req, res) => {
  res.render("signup", { message: "" });
};

exports.postSignup = async (req, res) => {
  const { first_name, last_name, email, password, confirm_password, role_name } = req.body;
  
  if (password !== confirm_password) {
    return res.render("signup", { message: "Passwords do not match." });
  }
  
  try {
    // Check if the email is already used
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render("signup", { message: "Email already in use." });
    }

    // Retrieve the role_id based on the role_name provided
    const role = await Role.findOne({ where: { role_name } });
    if (!role) {
      return res.render("signup", { message: "Invalid role selected." });
    }
    const role_id = role.role_id;

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create the user
    await User.create({
      F_Name: first_name,
      L_Name: last_name,
      email,
      password: password_hash,
      role_id
    });

    // Redirect to login page after successful registration
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return res.render("signup", {
      message: "An error occurred. Please try again.",
    });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect("/dashboard");
    }
    res.redirect("/");
  });
};



// Dashboard
// exports.getDashboard = (_req, res) => {
//   res.render("dashboard", { message: "" });
// };
