const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../src/models/user");
const { validateSignupData } = require("../utils/validation");
const { authUser } = require("../middlewares/auth");

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
        sameSite: "none", // CSRF protection
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
    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      expires: new Date(0),
    });
    res.send("Logout successfull.");
  } catch (error) {
    console.error("Error", error.message);
    res.status(500).send("ERROR: " + error.message);
  }
});

//reset password(for logged in user) - this is not same as forgot password(for logged out user who forgot own password)
authRouter.patch("/reset-password", authUser, async (req, res) => {
  try {
    const loggedInUser = req.user;
    //take old password, newpassword
    const { oldPassword, newPassword } = req.body;

    //verify the old password
    const isValid = await loggedInUser.validateUser(oldPassword);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials." });
    }
    const newHashPassword = await bcrypt.hash(newPassword, 10);

    //if true --> decrpt the new pass and save
    loggedInUser.password = newHashPassword;
    await loggedInUser.save();
    res.send({ message: "Password update successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Unexpected Error Occured!" + err.message);
  }
});

//forgot password
// ------TODO---------
module.exports = authRouter;
