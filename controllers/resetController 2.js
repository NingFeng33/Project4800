const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sendResetEmail } = require("../public/scripts/emailService");

exports.getEmail = (_, res) => {
  res.render("email", { message: "" });
};

exports.getReset = (_, res) => {
  res.render("reset", { message: "" });
};

exports.updatePassword = async (req, res) => {
  const { password } = req.body;

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

// exports.requestPasswordRequest = async (req, res) => {
//   const { email } = req.body;
//   const user = await User.findOne({
//     where: { email: email },
//   });

//   if (!user) {
//     return res.send(
//       "If that email address is in our database, we will send you an email to reset your password."
//     );
//   }
//   const token = crypto.randomBytes(32).toString("hex");
//   const expirationTime = Date.now() + 3600000; // 1 hour from now

//   // Store the token and expiration in the database
//   await user.update({
//     resetToken: token,
//     resetTokenExp: expirationTime,
//   });

//   // Send reset email with token
//   await sendResetEmail(email, token);

//   res.send("Eamil sent");
// };
