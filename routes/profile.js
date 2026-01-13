const express = require("express");
const bcrypt = require("bcrypt");
const { authUser } = require("../middlewares/auth");
const User = require("../src/models/user");
const profileRouter = express.Router();

//view profile
profileRouter.get("/view", authUser, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    console.error("Error", error.message);
    res.status(500).send("ERROR: " + error.message);
  }
});

// udpate profile
profileRouter.patch("/update", authUser, async (req, res) => {
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
