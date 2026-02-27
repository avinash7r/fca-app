import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB, disconnectDB } from "./src/lib/connectDB.js";
import { router as authRoutes } from "./src/routes/auth.routes.js";
import { router as messageRoutes } from "./src/routes/message.routes.js";
import { app, io, server } from "./src/lib/socket.js";
import {
  httpRequestCounter_middleware,
  httpRequestDuration_middleware,
} from "./src/middleware/httpRequestCounter.middleware.js";

// testing docker build on files changes github actions
// updated repo link

import { metrics } from "./src/lib/prom-client.js";
import cors from "cors";
import path from "path";
import exp from "constants";
const __dirname = path.resolve();
dotenv.config();

let activeRequests = 0;
let isShuttingDown = false;

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`Received ${signal}. Starting graceful shutdown...`);

  // 1. Stop accepting new connections
  server.close(() => {
    console.log("HTTP server closed");
  });

  // 2. Force shutdown if it takes too long
  const FORCE_EXIT_TIMEOUT = 10000; // 10 seconds

  const forceExit = setTimeout(() => {
    console.error("Shutdown timed out. Forcing exit.");
    process.exit(1);
  }, FORCE_EXIT_TIMEOUT);

  // 3. Wait for in-flight requests
  const waitForRequests = () =>
    new Promise((resolve) => {
      const interval = setInterval(() => {
        if (activeRequests === 0) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
    });

  await waitForRequests();
  console.log("All requests finished");

  // 4. Close DB connection
  await disconnectDB();
  console.log("MongoDB connection closed");

  clearTimeout(forceExit);
  process.exit(0);
};

// Handle termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// app.use((req, res, next) => {
//     const host = req.headers.host;
//     if (host && host.includes('onrender.com')) {
//       return res.redirect(301, `https://chat-app.avinashrajure.live${req.url}`);
//     }

//     next();
//   });

app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV === "dev") {
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    }),
  );
}

// app.use((req, res, next) => {
//   console.log({
//     method: req.method,
//     url: req.originalUrl,
//     body: req.body,
//     headers: req.headers["content-type"],
//   });
//   activeRequests++;
//   console.log(`Active Requests: ${activeRequests}`);
//   res.on("finish", () => {
//     activeRequests--;
//     console.log(`Active Requests Decremented: ${activeRequests}`);
//   });
//   next();
// });

app.use("/api/health", (req, res) => {
  res.status(200).send("Server is healthy");
});
app.use("/api/metrics", metrics);
app.use(
  "/api/auth",
  httpRequestCounter_middleware,
  httpRequestDuration_middleware,
  authRoutes,
);
app.use(
  "/api/message",
  httpRequestCounter_middleware,
  httpRequestDuration_middleware,
  messageRoutes,
);

// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, "../client/dist")));
//     app.get("*", (req, res) => {
//         res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
//     });
// }
// testing docker build on files changes github actions
const PORT = process.env.PORT;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
