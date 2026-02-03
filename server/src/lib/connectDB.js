import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const connectDB = async () =>{
    try {
        const conn=await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

export const disconnectDB = async () =>{
    try {
        await mongoose.connection.close();
        console.log("MongoDB disconnected");
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}