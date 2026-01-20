const jwt = require("jsonwebtoken");
const User = require("../src/models/user");

//this is the middleware function use for the valdate the user authentication
const authUser = async (req, res, next) => {
  const { token } = req.cookies;
  try {
    if (!token) {
      return res.status(401).send("Token not found");
    }
    const decodeObj = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodeObj._id);
    if (!user) {
      throw new Error("Invalid user!");
    }
    req.user = user;

    next();
  } catch (err) {
    console.error(err);
    res.status(500).send("ERROR: " + err.message);
  }
};

module.exports = { authUser };
