import { exec } from "child_process";
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
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    content: { type: String, required: true },
    reactions: [ReactionSchema],
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export const getCommentsByPostId = async (
  postId: string,
  page: number,
  limit: number
) => {
  return Comment.find({ post: postId, parent: null })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user")
    .exec();
};

export const getRepliesByCommentId = async (
  commentId: string,
  page: number,
  limit: number
) => {
  return Comment.find({ parent: commentId })
    .sort({ createdAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user")
    .exec();
};

export const countRepliesByCommentId = async (commentId: string) => {
  return Comment.countDocuments({ parent: commentId });
};

export const countCommentsByPostId = async (postId: string) => {
  return Comment.countDocuments({ post: postId });
};

export const addComment = async (values: Record<string, any>) => {
  const comment = new Comment(values);
  await comment.save();

  if (values.parent) {
    await Comment.findByIdAndUpdate(values.parent, {
      $push: { children: comment._id },
    });
  }

  return Comment.findById(comment._id)
    .populate("user")
    .populate({
      path: "parent",
      populate: { path: "user" },
    });
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
