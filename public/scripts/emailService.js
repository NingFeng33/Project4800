// Currently not working
const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // If using Gmail, otherwise update to your SMTP provider
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER, // Your email address
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

exports.sendResetEmail = async (email, token) => {
  try {
    const resetLink = `http://localhost:9040/reset/${token}`;

    // Send email
    const info = await transporter.sendMail({
      from: '"Your App Name" <your-email@gmail.com>', // Sender address
      to: email, // Recipient address
      subject: "Password Reset Request", // Subject line
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`, // Plain text body
      html: `
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you did not request a password reset, please ignore this email.</p>
      `,
    });

    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw new Error("Failed to send reset email");
  }
};
