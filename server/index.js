import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectDB } from './src/lib/connectDB.js';
import { router as authRoutes } from './src/routes/auth.routes.js';
import { router as messageRoutes } from './src/routes/message.routes.js';
import { app, io, server } from './src/lib/socket.js';
import cors from 'cors';
import path from 'path';    
const __dirname = path.resolve();
dotenv.config();

// app.use((req, res, next) => {
//     const host = req.headers.host;
//     if (host && host.includes('onrender.com')) {
//       return res.redirect(301, `https://chat-app.avinashrajure.live${req.url}`);
//     }
    
//     next();
//   });

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);


// if (process.env.NODE_ENV === 'production') {
//     app.use(express.static(path.join(__dirname, "../client/dist")));
//     app.get("*", (req, res) => {
//         res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
//     });
// }
const PORT = process.env.PORT;

server.listen(PORT,'0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
});
