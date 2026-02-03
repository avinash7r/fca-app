import { get } from "mongoose";
import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import {io,getReciversSocketId} from "../lib/socket.js";

export const getUserForSidebar = async (req, res) => {
    try {
        const Loggeduser=req.user._id;
        const filteredUsers=await User.find({_id:{$ne:Loggeduser}});
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({message:"Server Error in getting users"});
    }
};

export const getMessage = async (req, res) => {
    try {
        const Loggeduser=req.user._id;
        const receiverId=req.params.id;
        const messages=await Message.find({
            $or:[
                {senderId:Loggeduser,receiverId:receiverId},
                {senderId:receiverId,receiverId:Loggeduser}
            ]
        });
        // console.log("Messages fetched:", messages);
        res.status(200).json(messages);
    } catch (error) {
        console.log("Error fetching messages:", error);
        console.error(`Error: ${error.message}`);
        res.status(500).json({message:"Server Error in getting messages"});
    }
};

export const sendMessage = async (req, res) => {
    try {
        const {text,media}=req.body;
        const senderId=req.user._id;
        const receiverId=req.params.id;
        const mediaUrl="";
        if(media){
            const uploadResponse=await cloudinary.uploader.upload(media);
            mediaUrl=uploadResponse.secure_url;

        }
        const newMessage=new Message({
            senderId,
            receiverId,
            text,
            media:mediaUrl
        })
        await newMessage.save();
        const reciversSocketId=getReciversSocketId(receiverId);
        if(reciversSocketId){
            io.to(reciversSocketId).emit("newMessage",newMessage);
        }
        res.status(200).json(newMessage);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        res.status(500).json({message:"Server Error in sending message"});
    }
};