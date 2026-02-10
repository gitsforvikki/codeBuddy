const express = require("express");
const { Chat } = require("../src/models/chat");
const { authUser } = require("../middlewares/auth");

const chatRouter = express.Router();

//api call for fetch chats
chatRouter.get("/getchat/:withUserId", authUser, async (req, res) => {
  try {
    const { withUserId } = req.params;
    const loggedInUserId = req.user._id;
    let chat = await Chat.findOne({
      participants: { $all: [loggedInUserId, withUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });
    if (!chat) {
      chat = new Chat({
        participants: [loggedInUserId, withUserId],
        messages: [],
      });
      //if chat not found then create a chat with empty message
      await chat.save();
    }
    return res.json(chat);
  } catch (err) {
    console.error(err);
  }
});

module.exports = { chatRouter };
