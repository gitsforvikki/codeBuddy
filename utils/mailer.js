const axios = require("axios");

const BREVO_API_KEY = process.env.BREVO_API_KEY;

async function sendEmail(to, subject, html) {
  console.log("key" + BREVO_API_KEY);
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "codeBuddy.dev", email: "vk6484412@gmail.com" },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("Email sent:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Brevo API email error:",
      error.response?.data || error.message,
    );
    throw error;
  }
}

module.exports = { sendEmail };
