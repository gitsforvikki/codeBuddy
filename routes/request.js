const express = require("express");

const connectionRequestRouter = express.Router();
const { authUser } = require("../middlewares/auth");
const ConnectionRequest = require("../src/models/connectionRequest");
const User = require("../src/models/user");
const { sendEmail } = require("../utils/mailer");

connectionRequestRouter.post(
  "/send/:status/:toUserId",
  authUser,
  async (req, res) => {
    try {
      const toUserId = req.params.toUserId;
      const fromUserId = req.user._id;
      const status = req.params.status;
      const user = await User.findById(toUserId);
      const loggedInuser = req.user;

      const ALLOWED_STATUS_TYPE = ["interested", "ignored"];
      if (!ALLOWED_STATUS_TYPE.includes(status)) {
        return res.status(400).send("Invalid Status Type: " + status);
      }
      //check the user is exist or not, to which you send request
      const toUserExist = await User.findById(toUserId);
      if (!toUserExist) {
        return res.status(400).send({
          message: "User not found, Action Not Allowed",
        });
      }
      //check already connection exist or not
      const isAlredyConnectionExist = await ConnectionRequest.findOne({
        $or: [
          {
            toUserId,
            fromUserId,
          },
          {
            toUserId: fromUserId,
            fromUserId: toUserId,
          },
        ],
      });
      if (isAlredyConnectionExist) {
        return res.send({ message: "Connection Request Alredy Exist!" });
      }

      const newConnectionRequest = new ConnectionRequest({
        toUserId,
        fromUserId,
        status,
      });

      const data = await newConnectionRequest.save();
      await sendEmail(
        toUserExist.email,
        "New Connection Request on CodeBuddy",
        `
        <h2>Hello ${toUserExist.firstName} 👋</h2>
        <p>You have received a new connection request from <strong>${loggedInuser.firstName}</strong>.</p>
        <p>Log in to your account to accept or reject it.</p>
        <br/>
        <a href="https://codebuddydev.vercel.app">
          Go to CodeBuddy
        </a>
      `,
      );

      res.json({
        message: `You ${status} for ${user?.firstName}`,
        data,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("ERROR: " + err.message);
    }
  },
);

//accept or reject the connection request
connectionRequestRouter.post(
  "/review/:status/:requestId",
  authUser,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const loggedinUSer = req.user;

      //validate status
      const ALLOWED_STATUS_TYPE = ["accepted", "rejected"];
      if (!ALLOWED_STATUS_TYPE.includes(status)) {
        return res
          .status(400)
          .json({ message: `Invalid status type: ${status}` });
      }

      //check is there any interested request for loggedin user
      const activeConnectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedinUSer._id,
        status: "interested",
      });

      if (!activeConnectionRequest) {
        return res
          .status(404)
          .json({ message: "Active connection not found." });
      }

      //udpate the status
      activeConnectionRequest.status = status;
      const updatedConnection = await activeConnectionRequest.save();
      res.status(200).json({
        success: true,
        message: `Connection request ${status}`,
        data: updatedConnection,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("ERROR: " + err.message);
    }
  },
);

module.exports = connectionRequestRouter;
