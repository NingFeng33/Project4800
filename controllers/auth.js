const User = require("../models/user");
const Role = require("../models/role");
const bcrypt = require("bcrypt");

// GET: login page
exports.getLogin = (_req, res) => {
  res.render("login", { message: "" });
};

// POST: login
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, attributes: ["role_name"] }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render("login", { message: "Invalid email or password." });
    }

    req.session.userId = user.user_id;
    req.session.user = {
      user_id: user.user_id,
      role: user.Role.role_name,
      email: user.email,
      F_Name: user.F_Name,
      L_Name: user.L_Name,
    };

    req.session.save(() => res.redirect("/dashboard"));
  } catch (error) {
    res.render("login", { message: "An error occurred. Please try again." });
  }
};

// GET: sign up
exports.getSignup = (req, res) => {
  res.render("signup", { message: "" });
};

// POST: sign up
exports.postSignup = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    confirm_password,
    role_name,
  } = req.body;

  if (password !== confirm_password) {
    return res.render("signup", { message: "Passwords do not match." });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render("signup", { message: "Email already in use." });
    }

    const role = await Role.findOne({ where: { role_name } });
    if (!role) {
      return res.render("signup", { message: "Invalid role selected." });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await User.create({
      F_Name: first_name,
      L_Name: last_name,
      email,
      password: password_hash,
      role_id: role.role_id,
    });

    res.redirect("/");
  } catch (error) {
    res.render("signup", { message: "An error occurred. Please try again." });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) res.redirect("/dashboard");
    else res.redirect("/");
  });
};
