const mongoose = require("mongoose");

//here connect with database
const connectDB = async () => {
  mongoose.connect(
    "mongodb+srv://vk6484412_learn_db:vk6484412_learn_db@learn-backend.qzmivex.mongodb.net/devTinder?appName=learn-backend"
  );
};

module.exports = { connectDB };
