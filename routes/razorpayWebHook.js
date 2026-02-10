const express = require("express");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

const payments = require("../src/models/payments");
const User = require("../src/models/user");

const webhookRouter = express.Router();

webhookRouter.post("/", async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    // 1. VERIFY USING RAW BODY
    const isValid = validateWebhookSignature(
      req.body, 
      signature,
      webhookSecret,
    );

    if (!isValid) {
      console.log("Invalid webhook signature");
      return res.status(400).send("Invalid signature");
    }

    // ✅ 2. PARSE BODY AFTER VERIFICATION
    const event = JSON.parse(req.body.toString());
    const paymentDetails = event.payload.payment.entity;

    // ✅ 3. FIND PAYMENT SAFELY
    const payment = await payments.findOne({
      orderId: paymentDetails.order_id,
    });

    if (!payment) {
      console.log("Payment record not found:", paymentDetails.order_id);
      return res.status(200).json({ msg: "Payment not found" });
    }

    // ✅ 4. UPDATE PAYMENT
    payment.status = paymentDetails.status;
    payment.razorpayPaymentId = paymentDetails.id;
    await payment.save();

    // ✅ 5. UPDATE USER
    const user = await User.findById(payment.userId);
    if (user) {
      user.isPremium = true;
      user.membershipType = paymentDetails.notes?.membershipType;
      await user.save();
    }


    return res.status(200).json({ msg: "Webhook received successfully" });
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).json({ msg: err.message });
  }
});

module.exports = webhookRouter;
