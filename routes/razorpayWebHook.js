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

    const isValid = validateWebhookSignature(
      JSON.stringify(req.body),
      signature,
      webhookSecret,
    );
    if (!isValid) {
      return res.status(400).send("Invalid signature");
    }
    //this payment details have all information about the order
    const paymentDetails = req.body.payload.payment.entity;

    const payment = await payments.findOne({
      orderId: paymentDetails.order_id,
    });
    //update the payment status
    payment.status = paymentDetails.status;
    await payment.save();

    //find user ==> mark as premium and update memership type
    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = paymentDetails.notes.membershipType;
    await user.save();
    return res.status(200).json({ msg: "Webhook received successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err.message });
  }
});

module.exports = webhookRouter;
