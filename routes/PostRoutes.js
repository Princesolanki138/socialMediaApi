import express from "express";
import { requireSignIn, isAdmin } from "../middleware/authMidleware.js";
import { createCommentController, createPostController, likePostController } from "../controller/PostController.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// create post

router.post("/create", upload.single('media_Url'), requireSignIn, createPostController);

router.put("/:id/like", requireSignIn, likePostController);

router.put("/create-comment", requireSignIn, createCommentController)

export default router