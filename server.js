const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

app.use(cors());
app.use(express.json());

// Setup multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    },
});

const upload = multer({ storage });

// Serve static files
app.use("/uploads", express.static("uploads"));

// File upload route
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const fileUrl = `https://https://chatback-sif1.onrender.com/uploads/${req.file.filename}`; // Change to your actual backend URL
    res.json({ url: fileUrl });
});


io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("send_private_message", ({ sender, receiver, message, file }) => {
        io.emit("receive_private_message", { sender, message, file });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

server.listen(10000, () => {
    console.log("Server running on port 10000");
});
