import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "./logger.js";
dotenv.config();

export const connectDB = async () =>{
    try {
        const conn=await mongoose.connect(process.env.MONGO_URI);
        logger.info({ host: conn.connection.host }, "MongoDB connected");
    } catch (error) {
        logger.error({ err: error }, "MongoDB connection failed");
    }
}

export const disconnectDB = async () =>{
    try {
        await mongoose.connection.close();
        logger.info("MongoDB disconnected");
    } catch (error) {
        logger.error({ err: error }, "MongoDB disconnect failed");
    }
}