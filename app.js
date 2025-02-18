

const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./config/db")
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
connectDB();
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

io.sockets.setMaxListeners(20);

// Middleware
app.use(express.json());
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));



// Attach Socket.IO to requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use("/", authRoutes);
app.use("/api", eventRoutes);

// Handle Socket.IO Connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("disconnect", (reason) => {
        console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
    });

    socket.on("error", (error) => {
        console.error(`Socket error: ${error.message}`);
    });
});


// Export both app and server
module.exports = { app, server };
