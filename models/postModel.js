import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  content: {
    type: String,
  },
  media_Url: {
    type: String,
  },
  likes: {
    type: Array,
    default: []
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment",
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
})

postSchema.virtual("countcomment", {
  ref: "Comment",
  localField: "_id",
  foreignField: "postId",
  count: true
})

// Apply virtual properties to schema
postSchema.set("toObject", { virtuals: true });
postSchema.set("toJSON", { virtuals: true });

const Post = mongoose.model("Post", postSchema);

export default Post