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
    updatedAt: { type: Date, default: Date.now },
    reactions: [ReactionSchema],
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
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
    .populate("reactions.user")
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
    .populate("reactions.user")
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
  await Comment.deleteMany({ parent: id });
  return Comment.findByIdAndDelete(id);
};

export const updateComment = async (
  id: string,
  values: Record<string, any>
) => {
  return Comment.findByIdAndUpdate(id, values, { new: true })
    .populate("user")
    .exec();
};

export const reactToComment = async (
  commentId: string,
  userId: string,
  reaction: string
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new Error("Comment not found");

  const existingReactionIndex = comment.reactions.findIndex((r) =>
    r.user.equals(userId)
  );

  if (existingReactionIndex > -1) {
    if (reaction === "none") {
      comment.reactions.splice(existingReactionIndex, 1);
    } else {
      comment.reactions[existingReactionIndex].type = reaction;
    }
  } else {
    if (reaction !== "none") {
      comment.reactions.push({ user: userId, type: reaction });
    }
  }

  await comment.save();

  return Comment.findById(commentId)
    .populate("user")
    .populate("reactions.user")
    .exec();
};

export const Comment = mongoose.model("Comment", CommentSchema);
