const { User } = require("../models/user");
const bcrypt = require("bcrypt");

// Login
exports.getLogin = (_req, res) => {
  res.render("login", { message: "" });
};

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.render("login", { message: "Invalid email or password." });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.render("login", { message: "Invalid email or password." });
    }

    req.session.userId = user.user_id;
    req.session.role = user.role;

    req.session.save(() => {
      if (user.role === "Admin") {
        return res.redirect("/admin/dashboard");
      } else if (user.role === "Faculty") {
        return res.redirect("/faculty/dashboard");
      } else {
        return res.redirect("/dashboard");
      }
    });
  } catch (error) {
    console.error(error);
    return res.render("login", {
      message: "An error occurred. Please try again.",
    });
  }
};

// Sign up
exports.getSignup = (req, res) => {
  res.render("signup", { message: "" });
};

exports.postSignup = async (req, res) => {
  const { first_name, last_name, email, password, confirm_password, role } =
    req.body;
  if (password !== confirm_password) {
    return res.render("signup", { message: "Passwords do not match." });
  }
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render("signup", { message: "Email already in use." });
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    await User.create({ first_name, last_name, email, password_hash, role });
    return res.redirect("/login");
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
    res.redirect("/login");
  });
};

// Dashboard
// exports.getDashboard = (_req, res) => {
//   res.render("dashboard", { message: "" });
// };
