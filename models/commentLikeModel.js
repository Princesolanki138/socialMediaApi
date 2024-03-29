import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  content: {
    type: String,
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})


export const Comment = mongoose.model("Comment", commentSchema);

export default { Comment }