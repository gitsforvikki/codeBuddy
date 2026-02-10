// const socket = require("socket.io");

// const initializeSocket = (server) => {
//   const io = socket(server, {
//     cors: {
//       origin: "http://localhost:5173",
//     },
//   });

//   //since we are on server, so here i will handle connection comes from client
//   io.on("connection", (socket) => {
//     //handle the events
//     socket.on("joinChat", ({ firstName, loggedInUserId, withUserId }) => {
//       const roomId = [loggedInUserId, withUserId].sort().join("_");
//       console.log(firstName + " join this room id " + roomId);
//       socket.join(roomId);
//     });
//     socket.on(
//       "sendMessage",
//       ({ firstName, loggedInUserId, withUserId, text }) => {
//         const roomIdd = [loggedInUserId, withUserId].sort().join("_");
//         console.log("Room id " + roomIdd);
//         console.log(firstName + " says " + text);
//         io.to(roomIdd).emit("receivedMessage", { firstName, text });
//       },
//     );
//     socket.on("disconnect", () => {});
//   });
// };

// module.exports = { initializeSocket };

const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../src/models/chat");
const generateRoomId = (loggedInUserId, withUserId) => {
  return crypto
    .createHash("sha256")
    .update([loggedInUserId, withUserId].sort().join("_"))
    .digest("hex");
};
const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinChat", ({ firstName, loggedInUserId, withUserId }) => {
      const roomId = generateRoomId(loggedInUserId, withUserId);
      socket.join(roomId); // ✅ ACTUALLY JOIN
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, loggedInUserId, withUserId, text }) => {
        try {
          const roomId = generateRoomId(loggedInUserId, withUserId);

          let chat = await Chat.findOne({
            participants: { $all: [loggedInUserId, withUserId] },
          });
          if (!chat) {
            chat = new Chat({
              participants: [loggedInUserId, withUserId],
              messages: [],
            });
          }

          chat.messages.push({ senderId: loggedInUserId, text });

          await chat.save();

          io.to(roomId).emit("messageReceived", { firstName, lastName, text }); // ✅ normalized name
        } catch (err) {
          console.error(err);
        }
      },
    );

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

module.exports = { initializeSocket };
