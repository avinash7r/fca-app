import http from "http";
import { Server } from "socket.io";
import express from "express";

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
  console.log(`User Connected: ${socket.id}`);
  console.log(
    JSON.stringify({
      level: "info",
      event: "socket_connected",
      socketId: socket.id,
    }),
  );
  const userID = socket.handshake.query.userID;
  if (userID) userSocketMap[userID] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
    delete userSocketMap[userID];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});
export { app, io, server };
