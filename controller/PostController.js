import Post from "../models/postModel.js";
import Comment from "../models/commentLikeModel.js";
import { commentPost, likePost } from "../helper/notificationService.js";
import uploadFile from "../utils/cloudinery.config.js";

export const createPostController = async (req, res) => {
  try {
    const newPost = new Post(req.body);

    const mediaLocalPath = req.file?.path;
    const media_Url = await uploadFile(mediaLocalPath);

    const savedPost = await newPost.save();



    res.status(201).send({
      success: true,
      message: "Post created successfully",
      post: savedPost,
      media_Url: media_Url?.url,
      userId: req.user._id
    })

  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Error while creating post",
    })

  }
}

//like  / dislike post

export const likePostController = async (req, res) => {
  try {
    // Find the post by ID
    const post = await Post.findById(req.params.id);

    // Check if the post exists
    if (!post) {
      return res.status(404).send({
        success: false,
        message: "Post not found",
      });
    }

    // Check if the user has already liked the post
    if (!post.likes.includes(req.user._id)) {
      // If the user hasn't liked the post, add their ID to the likes array
      await post.updateOne({ $push: { likes: req.user._id } });
      likePost(req.user._id, post._id)
      return res.status(200).send({
        success: true,
        message: "Post liked",
      });
    } else {
      // If the user has already liked the post, remove their ID from the likes array
      await post.updateOne({ $pull: { likes: req.user._id } });
      return res.status(200).send({
        success: true,
        message: "Post disliked",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "Error while liking/disliking post",
      error: error.message,
    });
  }
};

// get a post

export const getPostController = async (req, res) => {
  try {

    const post = await Post.findById(req.params.id);
    res.status(200).send({
      success: true,
      post
    })

  } catch (error) {

  }
}


export const createCommentController = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user._id;

    // Create the comment
    const comment = await Comment.Comment.create({ userId, postId, content });

    // Find the post and add the comment to its comments array
    const post = await Post.findByIdAndUpdate(postId, { $push: { comments: comment._id } }, { new: true });

    commentPost(userId._id, post._id)

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      comment,
      post,
      userId: req.user._id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while creating comment",
      error: error.message
    });
  }
};
