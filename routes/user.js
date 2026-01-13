const express = require("express");
const User = require("../src/models/user");
const { authUser } = require("../middlewares/auth");
const ConnectionRequest = require("../src/models/connectionRequest");

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



//get user by id
userRouter.get("/me", authUser, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (err) {
    console.error(err);
    res.status(500).send("Unexpected Error Occured!");
  }
});

//feed --> get all users
userRouter.get("/feed", authUser, async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length === 0) {
      res.send("There are no users!");
    } else {
      res.send(users);
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Unexpected Error Occured!");
  }
});

//update user
/**
 * API level senetzation:- you can senetize your each fields at the route handlers
 */
userRouter.patch("/update-user", authUser, async (req, res) => {
  const userId = req.user._id;
  const data = req.body;

  try {
    //only below fields are allowd for update
    const FIELDS_ALLOWED_FOR_UPDATE = [
      "age",
      "gender",
      "photoUrl",
      "about",
      "skills",
      "email",
    ];

    const isAllowed = Object.keys(data).every((k) =>
      FIELDS_ALLOWED_FOR_UPDATE.includes(k)
    );

    if (!isAllowed) {
      throw new Error("Update not allowed.");
    }

    const updatedUser = await User.findByIdAndUpdate({ _id: userId }, data, {
      returnreturnDocument: "after",
      runValidators: true, // Allow custome validator run on update user as well
    });
    res.send("User update successfully!");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Unexpected Error Occured!" + err.message);
  }
});

//delete user
userRouter.delete("/delete-user", authUser, async (req, res) => {
  const userId = req.user._id;
  try {
    //you can use findByIdAndDelete({_id : userId}) as well
    await User.findByIdAndDelete(userId);
    res.send("User deleted successfully.");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Unexpected Error Occured!");
  }
});

module.exports = userRouter;
