const User = require("../models/user");
const bcrypt = require("bcrypt");

// GET: password reset
exports.getReset = (_, res) => {
  res.render("reset", { message: "" });
};

// PATCH: update password
exports.updatePassword = async (req, res) => {
  const { password } = req.body;

  console.log("Session userId:", req.session.userId);
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(400).json({ message: "User not authenticated" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).end();
  } catch (error) {
    console.error("Error updating password: ", error);
    res.status(500).json({ message: "Failed to update password" });
  }
};
