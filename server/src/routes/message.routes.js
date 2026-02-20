import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { getUserForSidebar, getMessage, sendMessage } from '../controllers/message.controller.js';


const router = express.Router();

router.get("/users",authMiddleware,getUserForSidebar);
router.get("/:id",authMiddleware,getMessage);
router.post("/send/:id",authMiddleware,sendMessage);

export {router};