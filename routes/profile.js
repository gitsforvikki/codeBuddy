const express = require("express");
const bcrypt = require("bcrypt");
const { authUser } = require("../middlewares/auth");
const User = require("../src/models/user");
const AppError = require("../utils/AppError");
const profileRouter = express.Router();

//view profile
profileRouter.get("/view", authUser, async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return next(new AppError("User not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error); // delegate to global error handler
  }
});
// update profile
profileRouter.patch("/update", authUser, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const data = req.body;

    const FIELDS_ALLOWED_FOR_UPDATE = [
      "age",
      "gender",
      "photoUrl",
      "about",
      "skills",
    ];

    const isAllowed = Object.keys(data).every((field) =>
      FIELDS_ALLOWED_FOR_UPDATE.includes(field)
    );

    if (!isAllowed) {
      return next(
        new AppError("first name & last name are not allowed to update", 400)
      );
    }

    const updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return next(new AppError("User not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    next(err); // forward to global error handler
  }
});

//forgot password
profileRouter.patch("/password", authUser, async (req, res) => {
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

//delete profle
profileRouter.delete("/delete", authUser, async (req, res) => {
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
module.exports = profileRouter;
