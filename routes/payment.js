const express = require("express");
const { authUser } = require("../middlewares/auth");
const razorpay = require("../utils/razorpay");
const payments = require("../src/models/payments");
const paymentRouter = express.Router();

const fixedAmount = {
  silver: 50000,
  gold: 90000,
};
//create order
paymentRouter.post("/create", authUser, async (req, res) => {
  try {
    const { membershipType } = req.body;
    // const membershipType = "silver";
    const { _id, firstName, lastName } = req.user;
    const order = await razorpay.orders.create({
      amount: fixedAmount[membershipType],
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        membershipType,
      },
    });
    const { id, amount, currency, receipt, notes, status } = order;
    const newPayment = new payments({
      userId: _id,
      //   paymentId:"",
      orderId: id,
      amount,
      status,
      currency,
      receipt,
      notes,
    });
    const createdOrder = await newPayment.save();
    res.status(200).json({ createdOrder, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error(err);
  }
});

module.exports = paymentRouter;
