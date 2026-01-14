const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/database");
const authRouter = require("../routes/auth");
const profileRouter = require("../routes/profile");
const userRouter = require("../routes/user");
const connectionRequestRouter = require("../routes/request");
const ErrorHandler = require("../middlewares/ErrorHandler");

/**
 *  Allow our express server to understant the json data-> this express.json() middleware convert
 *  the json received from client to javascript object
 *
 * this cookieParser used for allow the server to read the cookie
 */
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

//route handlers
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/profile", profileRouter);
app.use("/request", connectionRequestRouter);
app.use(ErrorHandler);
//DB connection
connectDB()
  .then(() => {
    console.log("mongoDB connection establised.....");
    app.listen(3000, () => {
      console.log("Server listening at port:3000");
    });
  })
  .catch((error) => console.error("mongoDB connection failed"));
