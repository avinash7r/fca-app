import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createToken } from "../lib/util.js";
import cloudinary from "../lib/cloudinary.js";
import logger from "../lib/logger.js";

export const registerUser = async (req, res) => {
    try {
        if (!req.body.username || !req.body.email || !req.body.password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        if (req.body.password.length < 6) {
            return res.status(400).json({ message: "Password should be at least 6 characters" });
        }
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashPassword,
        });
        try {
            await newUser.save();
            createToken(newUser._id, res);
            return res.status(201).json({
                message: "User created successfully",
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email
                }
            });
        } catch (error) {
            logger.error({ err: error }, "Error saving new user");
            return res.status(500).json({ message: "Error creating user" });
        }

    } catch (error) {
        logger.error({ err: error }, "Error in registerUser");
    }
}

export const loginUser = async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }
        const existingUser=await User.findOne({email:req.body.email});
        if (!existingUser) {
            return res.status(400).json({ message: "User not found" });
        }
        const isPasswordCorrect=await bcrypt.compare(req.body.password,existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid password" });
        }
        createToken(existingUser._id,res);
        return res.status(200).json({
            message: "Logged in successfully",
            user: {
                username: existingUser.username,
                email: existingUser.email
            }
        });
    } catch (error) {
        logger.error({ err: error }, "Error in loginUser");
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.cookie('token', '', {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        logger.error({ err: error }, "Error in logoutUser");
    }
};

export const updateUser = async (req, res) => {
    try {
        const recProfilePic=req.body;
        if (!recProfilePic) {
            return res.status(400).json({ message: "Please provide a profile picture" });
        }
        const cloudinaryResponse=await cloudinary.uploader.upload(recProfilePic.profileImage)
        const user=await User.findByIdAndUpdate(req.user._id,{profilePic:cloudinaryResponse.secure_url},{new:true});
        return res.status(200).json(user);
    } catch (error) {
        logger.error({ err: error }, "Error in updateUser");
        res.status(500).json({ message: "Server error updating Profile" });
    }
};

export const checkAuth = async (req, res) => {
    try {
        res.status(200).json({ user: req.user });
    } catch (error) {
        logger.error({ err: error }, "Error in checkAuth");
        res.status(500).json({ message: "Server error checking authentication" });
    }
};