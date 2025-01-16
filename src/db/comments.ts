import mongoose from "mongoose";

const ReactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String },
  },
  { timestamps: true }
);

const CommentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Author of the comment
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true }, // Associated post
    content: { type: String, required: true }, // Content of the comment
    reactions: [ReactionSchema],
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    }, // Reference to parent comment
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }], // References to child comments
  },
  { timestamps: true }
);

export const getCommentsByPostId = async (
  postId: string,
  page: number,
  limit: number
) => {
  const cmt = Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user")
    .exec();

  console.log("cmt: ", cmt);
  return cmt;
};

export const getOnly2CommentsByPostId = async (postId: string) => {
  return Comment.find({ post: postId })
    .sort({ createdAt: -1 })
    .limit(2)
    .populate("user")
    .exec();
};

export const countCommentsByPostId = async (postId: string) => {
  return Comment.countDocuments({ post: postId });
};

export const addComment = async (values: Record<string, any>) => {
  const comment = new Comment(values);
  await comment.save();
  return Comment.findById(comment._id).populate("user");
};

export const deleteComment = async (id: string) => {
  return Comment.findByIdAndDelete(id);
};

export const updateComment = async (
  id: string,
  values: Record<string, any>
) => {
  return Comment.findByIdAndUpdate(id, values, { new: true });
};

export const Comment = mongoose.model("Comment", CommentSchema);
