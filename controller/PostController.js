import Post from "../models/postModel.js";
import Comment from "../models/commentLikeModel.js";
import { commentPost, likePost } from "../helper/notificationService.js";
import uploadFile from "../utils/cloudinery.config.js";
import User from "../models/userModel.js";

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
      post: {
        postId: post._id,
        content: post.content,
        media_Url: post.media_Url,
        likes: post.likes,
        comments: post.comments
      }
    })

  } catch (error) {

    res.status(500).send({
      success: false,
      message: "Error while getting post",
      error: error.message
    })

  }
}


export const createCommentController = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user._id;

    const comment = await Comment.Comment.create({ userId, postId, content });


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

// get timeline post 

export const getallPostController = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const UserPosts = await Post.find({ userId: currentUser._id });
    const frindsPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    )
    res.status(200).send({
      success: true,
      message: "Posts fetched successfully",
      userId: req.user._id,
      Posts: UserPosts.concat(...frindsPosts)

    })
  } catch (error) {

    res.status(500).send({
      success: false,
      message: "Error while getting posts",
      error: error.message
    })

  }
}

// only admin can delete post 

export const deletePostController = async (req, res) => {
  try {

    const post = await Post.findByIdDelete(req.params.id);

    res.status(200).send({
      success: true,
      message: "Post deleted successfully",
      post
    })


  } catch (error) {

    res.status(500).send({
      success: false,
      message: "Error while deleting post",
      error: error.message
    })
  }
}