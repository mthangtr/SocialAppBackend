import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());

const ReactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    media: [{ type: String }],
    reactions: [ReactionSchema],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    privacy: { type: String, default: "public" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Post = mongoose.model("Post", PostSchema);

export const createPost = async (values: Record<string, any>) => {
  const post = new Post(values);
  return post.save().then((post) => post.toObject());
};

export const getPosts = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return Post.find()
    .populate("user")
    .populate("reactions.user")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

export const getPostById = async (id: string) =>
  Post.findById(id).populate("user").populate("reactions.user").exec();
export const deletePost = async (id: string) => Post.findByIdAndDelete(id);
export const updatePost = async (id: string, values: Record<string, any>) =>
  Post.findByIdAndUpdate(id, values, { new: true });

export const getPostsByUserId = async (userId: string): Promise<any> => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const objectId = new mongoose.Types.ObjectId(userId);
  return Post.find({ user: objectId })
    .populate("user")
    .populate("reactions.user")
    .exec();
};

export const reactToPost = async (
  postId: string,
  userId: string,
  reaction: string
) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Post not found");

  const existingReactionIndex = post.reactions.findIndex((r) =>
    r.user.equals(userId)
  );

  if (existingReactionIndex > -1) {
    if (reaction === "none") {
      post.reactions.splice(existingReactionIndex, 1);
    } else {
      post.reactions[existingReactionIndex].type = reaction;
    }
  } else {
    if (reaction !== "none") {
      post.reactions.push({ user: userId, type: reaction });
    }
  }

  await post.save();
  return post;
};
