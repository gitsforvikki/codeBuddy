const express = require("express");
const User = require("../src/models/user");
const { authUser } = require("../middlewares/auth");
const ConnectionRequest = require("../src/models/connectionRequest");
const { connection } = require("mongoose");

const userRouter = express.Router();

const USER_SAFE_INFO = ["firstName", "lastName", "age", "about", "skills"];

// GET-> /user/request/pending
userRouter.get("/requests/pending", authUser, async (req, res) => {
  try {
    // find the loggedin user
    const loggedInUser = req.user;
    //find the active requests
    const pendingConnectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_INFO);

    if (pendingConnectionRequests.length === 0) {
      return res.status(404).json({ message: "Pending request not found." });
    }

    res.send(pendingConnectionRequests);
  } catch (err) {
    console.error(err);
    res.status(500).send("ERROR: " + err.message);
  }
});

//GET-> /user/connections
userRouter.get("/connections", authUser, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_INFO)
      .populate("toUserId", USER_SAFE_INFO);

    if (connections.length === 0) {
      return res.status(404).send("Connections not found.");
    }
    const connectedPrifles = connections?.map((e) => {
      if (e.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return e.toUserId;
      }
      return e.fromUserId;
    });
    res.send(connectedPrifles);
  } catch (err) {
    console.error(err);
    res.status(500).send("ERROR: " + err.message);
  }
});

//Feed api
userRouter.get("/feed", authUser, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 40 ? 10 : limit;
    const skip = (page - 1) * limit;
    const loggedInUser = req.user;
    //find out all connection documents where i am either a connecton sender or receiver
    const connections = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hiddeUserFromFeed = new Set();
    connections.forEach((each) => {
      hiddeUserFromFeed.add(each.fromUserId.toString());
      hiddeUserFromFeed.add(each.toUserId.toString());
    });
    //getting all profiles except connections(interested, rejected, accepted,ignored ) and user itself
    const servedFeed = await User.find({
      $and: [
        {
          _id: { $nin: Array.from(hiddeUserFromFeed) },
        },
        {
          _id: { $ne: loggedInUser._id },
        },
      ],
    })
      .select(USER_SAFE_INFO)
      .skip(skip)
      .limit(limit);

    res.send(servedFeed);
  } catch (err) {
    console.error(err);
    res.status(500).send("ERROR: " + err.message);
  }
});

module.exports = userRouter;
