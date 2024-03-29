import express from "express";
import { requireSignIn, isAdmin } from "../middleware/authMidleware.js";
import { getMessageHistoryController, sendMessageController } from "../controller/messageController.js";

const router = express.Router();

router.post("/create-send-msg", requireSignIn, sendMessageController);

router.get("/:id/history", requireSignIn, getMessageHistoryController)

export default router;