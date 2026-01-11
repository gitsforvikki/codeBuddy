const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { connectDB } = require("./config/database");
const { validateSignupData } = require("../utils/validation");
const { authUser } = require("../middlewares/auth");
const User = require("./models/user");

const app = express();

/**
 *  Allow our express server to understant the json data-> this express.json() middleware convert
 *  the json received from client to javascript object
 */
app.use(express.json());

//this cookieParser used for allow the server to read the cookie
app.use(cookieParser());

//route handlers
app.post("/signup", async (req, res) => {
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
app.post("/login", async (req, res) => {
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

      res.status(200).send("Login success!");
    } else {
      throw new Error("Invalid user!");
    }
  } catch (error) {
    console.error("Error", error.message);
    res.status(500).send("ERROR: " + error.message);
  }
});

//Profile
app.get("/profile", authUser, async (req, res) => {
  try {
    const profile = req.user;
    res.send(profile);
  } catch (error) {
    console.error("Error", error.message);
    res.status(500).send("ERROR: " + error.message);
  }
});

//get a user by email
app.get("/user", async (req, res) => {
  try {
    const userEmail = req.body.email;
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Unexpected Error Occured!");
  }
});

//feed --> get all users
app.get("/feed", authUser, async (req, res) => {
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
app.patch("/user", authUser, async (req, res) => {
  const userId = req.user._id;
  const data = req.body;

  try {
    //only below fields are allowd for update
    const FIELDS_ALLOWED_FOR_UPDATE = [
      "userId",
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
app.delete("/user", authUser, async (req, res) => {
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

connectDB()
  .then(() => {
    console.log("mongoDB connection establised.....");
    app.listen(3000, () => {
      console.log("Server listening at port:3000");
    });
  })
  .catch((error) => console.error("mongoDB connection failed"));
