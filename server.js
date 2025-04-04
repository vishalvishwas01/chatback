require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());

const users = {}; // Store users and their socket IDs

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins with a username
  socket.on("join", (username) => {
    users[username] = socket.id;
    console.log(`${username} joined with ID: ${socket.id}`);
  });

  // Send private message
  socket.on("send_private_message", ({ sender, receiver, message }) => {
    const receiverSocketId = users[receiver];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receive_private_message", { sender, message });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    for (let user in users) {
      if (users[user] === socket.id) {
        delete users[user];
        break;
      }
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
