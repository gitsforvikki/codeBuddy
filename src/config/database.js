const mongoose = require("mongoose");
const mongoUrl = process.env.MONGO_CLOUDE_URL;
//here connect with database
const connectDB = async () => {
  mongoose.connect(mongoUrl);
};

module.exports = { connectDB };
