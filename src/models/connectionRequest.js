const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
  },
  status: {
    type: string,
    enum: {
      values: ["interested", "ignored", "accepted", "rejected"],
      message: `{VALUE} is not status type!`,
    },
    require: true,
  },
});

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequestModel",
  connectionRequestSchema
);

module.exports = ConnectionRequestModel;
