const express = require("express");
const { sendEmail } = require("../utils/mailer");

const emailRouter = express.Router();

emailRouter.post("/send-test", async (req, res) => {
  try {
    const { email } = req.body;

    await sendEmail(
      email,
      "Codebuddy Test Email",
      `<h2>Hello Vikash 👋</h2><p>This is a test email sent from codebuddy via brevo api.</p>`,
    );

    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Email failed" });
  }
});

module.exports = emailRouter;
