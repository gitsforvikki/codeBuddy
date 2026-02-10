require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/database");
const authRouter = require("../routes/auth");
const profileRouter = require("../routes/profile");
const userRouter = require("../routes/user");
const connectionRequestRouter = require("../routes/request");
const ErrorHandler = require("../middlewares/ErrorHandler");
const emailRouter = require("../routes/email");
const http = require("http");
const { initializeSocket } = require("../utils/socket");
const { chatRouter } = require("../routes/ChatRoutes");
const paymentRouter = require("../routes/payment");
const webhookRouter = require("../routes/razorpayWebHook");

/**
 *  Allow our express server to understant the json data-> this express.json() middleware convert
 *  the json received from client to javascript object
 *
 * this cookieParser used for allow the server to read the cookie
 */
const app = express();
require("../utils/cronJob");
app.use(
  cors({
    origin: [process.env.LOCAL_HOST, process.env.FRONTEND_URL],
    credentials: true,
  }),
);

app.use(
  "/api/webhook/razorpay",
  express.raw({ type: "application/json" }),
  webhookRouter,
);

app.use(express.json());
app.use(cookieParser());

//route handlers
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/profile", profileRouter);
app.use("/request", connectionRequestRouter);
app.use("/email", emailRouter);
app.use("/chat", chatRouter);
app.use("/payment", paymentRouter);
app.use(ErrorHandler);

// DB + Server start
const PORT = process.env.PORT || 3000;

//scket setup
const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("mongoDB connection establised.....");
    server.listen(PORT, () => {
      console.log("Server listening at port:" + PORT);
    });
  })
  .catch((error) => console.error("mongoDB connection failed"));
