const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../src/models/user");
const { validateSignupData } = require("../utils/validation");
const authRouter = express.Router();
authRouter.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    //validate user data
    validateSignupData(req);
    //encrypt password
    const passwordHash = await bcrypt.hash(password, 10); //salt 10 round
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });
    await newUser.save();
    res.send("Signup successfully.");
  } catch (error) {
    console.error("Error", error.message);
    res.status(500).send("ERROR: " + error.message);
  }
});

//login user
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid user!");
    }

    //compare the password
    const isValid = await user.validateUser(password);
    if (isValid) {
      //if user is valid then generate token
      const token = await user.getJWT();

      //attach the token with cookie and send back to the client
      res.cookie("token", token, {
        httpOnly: true, // JS cannot access it (XSS safe)
        secure: true, // HTTPS only
        sameSite: "strict", // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).send(user);
    } else {
      throw new Error("Invalid user!");
    }
  } catch (error) {
    console.error("Error", error.message);
    res.status(500).send("ERROR: " + error.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    res.send("Logout successfull.");
  } catch (error) {
    console.error("Error", error.message);
    res.status(500).send("ERROR: " + error.message);
  }
});
module.exports = authRouter;
