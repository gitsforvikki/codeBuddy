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
    type: String,
    enum: {
      values: ["interested", "ignored", "accepted", "rejected"],
      message: `{VALUE} is not status type!`,
    },
    require: true,
  },
});
//create compound indexes
connectionRequestSchema.index({ toUserId: 1, fromUserId: 1 });

//this function is always called before data save to DB
connectionRequestSchema.pre("save", async function () {
  const connectionRequest = this;

  if (connectionRequest.toUserId.equals(connectionRequest.fromUserId)) {
    throw new Error("Can not send connection request to youself.");
  }
});

const ConnectionRequestModel = mongoose.model(
  "ConnectionRequestModel",
  connectionRequestSchema
);

module.exports = ConnectionRequestModel;
