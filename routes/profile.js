const express = require("express");
const { authUser } = require("../middlewares/auth");
const profileRouter = express.Router();

profileRouter.get("/view", authUser, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    console.error("Error", error.message);
    res.status(500).send("ERROR: " + error.message);
  }
});

profileRouter.patch("/edit", authUser, async (req, res) => {
  try {
    const user = req.user;
    res.send("edit user profile pending");
  } catch (error) {
    console.error("Error", error.message);
    res.status(500).send("ERROR: " + error.message);
  }
});

module.exports = profileRouter;
