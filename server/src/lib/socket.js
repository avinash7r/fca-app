import http from "http";
import { Server } from "socket.io";
import express from "express";
import logger from "./logger.js";

const app = express();
const server = new http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    credentials: true,
  },
});

const userSocketMap = {};

export const getReciversSocketId = (reciverID) => {
  if (!userSocketMap[reciverID]) return;
  return userSocketMap[reciverID];
};

io.on("connection", (socket) => {
  logger.info({ event: "socket_connected", socketId: socket.id }, "User connected");

  const userID = socket.handshake.query.userID;
  if (userID) {
    userSocketMap[userID] = socket.id;
    logger.info({ event: "user_login", userID, socketId: socket.id }, "User logged in");
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    logger.info({ event: "user_logout", userID, socketId: socket.id }, "User disconnected");
    delete userSocketMap[userID];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
export { app, io, server };

