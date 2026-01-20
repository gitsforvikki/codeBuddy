const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, "FirstName is required"],
      minLength: [4, "Minimum length of firstName should be 4."],
      maxlength: [30, "First name cannot exceed 30 characters"],
      match: [/^[A-Za-z]+$/, "First name must contain only letters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [30, "Last name cannot exceed 30 characters"],
      match: [/^[A-Za-z]*$/, "Last name must contain only letters"],
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "Email is required"],
      trim: true,
      unique: true, //this will do indexing as like index:true
      // match: [
      //   /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      //   "Please enter a valid email address",
      // ],
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters"],
      validate: {
        validator: validator.isStrongPassword,
        message: "Enter strong password",
      },
    },
    age: {
      type: Number,
      min: [18, "Age must be at least 18"],
      max: [120, "Age seems invalid"],
    },
    gender: {
      type: String,
      lowercase: true,
      enum: {
        values: ["male", "female", "others"],
        message: `{VALUE} is not supported`,
      },
    },
    photoUrl: {
      type: String,
      trim: true,
      default:
        "https://smsdelhibmw.co.in/wp-content/uploads/2022/02/User-Profile-PNG.png",
      validate: {
        validator: validator.isURL,
        message: "Enter a valid image url.",
      },
    },
    about: {
      type: String,
      trim: true,
      maxlength: [300, "About section cannot exceed 300 characters"],
      default: "This is the default about section",
    },
    skills: {
      type: [String],
      validate: {
        validator: function (value) {
          return value.length <= 10;
        },
        message: "You can add up to 10 skills only",
      },

      //Normalizing:-remove duplicate and make consistency with all lower case
      set: (skills) => [...new Set(skills.map((s) => s.toLowerCase().trim()))],
    },
  },
  {
    timestamps: true,
  }
);

//these are the mongoose schema mothods:- these are works like helper functions
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET , {
    expiresIn: "1d",
  });
  return token;
};

userSchema.methods.validateUser = async function (userPassword) {
  const user = this;
  const hashPassword = user.password;
  const isVallide = await bcrypt.compare(userPassword, hashPassword);
  return isVallide;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
