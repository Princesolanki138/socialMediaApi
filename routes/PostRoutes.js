import express from "express";
import { requireSignIn, isAdmin } from "../middleware/authMidleware.js";
import { createCommentController, createPostController, deletePostController, getPostController, getallPostController, likePostController } from "../controller/PostController.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// create post

router.post("/create", upload.single('media_Url'), requireSignIn, createPostController);

router.delete("/:id/delete", requireSignIn, isAdmin, deletePostController);

router.put("/:id/like", requireSignIn, likePostController);

router.post("/create-comment", requireSignIn, createCommentController)

router.get("/:id/userpost", requireSignIn, getPostController)

router.get("/timeline/all", requireSignIn, getallPostController)

export default router