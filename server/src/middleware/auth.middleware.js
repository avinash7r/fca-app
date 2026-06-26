import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import logger from "../lib/logger.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(decoded.userID).select("-password");
    req.user = user;
    // console.log("Authenticated user:", user);
    next();
  } catch (error) {
    logger.error({ err: error }, "Auth middleware error");
  }
};
