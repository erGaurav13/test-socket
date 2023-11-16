// server.js (Node.js server)
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
let port= process.env.PORT||4001
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000/",
    credentials: true,
  },
});

io.use(cors())
let userInfo = [];

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // Test connection function
  socket.on("testConnection", (msg) => {
    console.log("Client message:", msg);
    // Respond to the client
    socket.emit("testConnection", "Testing connection from server");
  });

  socket.on("joinRoom", async (data) => {
    console.log("data in join room ✈✈✈ ====>", data);

    //user joined in room
    socket.join(data.room);
    //checking in the array is user already present
    let isUserPresent = userInfo.findIndex((x) => x.userId == data.userId);
    // pushing the user data in this array to keep record
    if (isUserPresent == -1) {
      userInfo.push({
        roomId: data.room,
        userId: data.userId,
        socketId: socket.id,
      });
    }
    function getClientsInRoom(roomId) {
      const room = io.sockets.adapter.rooms.get(roomId);
      return room ? Array.from(room) : [];
    }
    const clientsInRoom = getClientsInRoom(data.room);

    console.log(`clients present in room ${data.room}`, clientsInRoom);
    //check already user present in this room or not
    let findUser = userInfo.filter((x) => x.roomId == data.room);

    socket.on("sendMessage", (message) => {
      // Broadcast the message to everyone in the room
      console.log(message);
      io.sockets.in(data.room).emit("receiveMessage", {
        userId: data.userId,
        message,
      });
    });

    socket.on("disconnect", () => {
      // Handle the disconnect event here
      console.log(`${data.userId} has left the room`);

      // Remove the user from userInfo array
      userInfo = userInfo.filter((user) => user.socketId !== socket.id);
    });
  });
});

httpServer.listen(port, () => {
  console.log("Server is running on port ",port);
});
