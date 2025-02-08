import mongoose from "mongoose";
import express from "express";
import bodyParser from "body-parser";
import { Comment } from "./comments";
import { User } from "./users";

const app = express();

app.use(bodyParser.json());

const ReactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: false, default: "" },
  media: [{ type: String }],
  reactions: [ReactionSchema],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  privacy: { type: String, default: "public" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Post = mongoose.model("Post", PostSchema);

export const createPost = async (values: Record<string, any>) => {
  const { content, media, user } = values;

  if ((!content || content.trim() === "") && (!media || media.length === 0)) {
    throw new Error("Post must have either content or media.");
  }

  const post = new Post({
    user,
    content: content?.trim() || "",
    media: media || [],
  });

  await post.save();
  return Post.findById(post._id).populate("user").populate("reactions.user");
};

export const getPosts = async (userId: string, page: number, limit: number) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  const skip = (page - 1) * limit;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Get the user's friends list
  const user = await User.findById(userId).select("friends").exec();
  if (!user) {
    throw new Error("User not found");
  }

  const friendIds = user.friends.map((friend) => friend.toString());

  // Fetch posts based on privacy settings
  return Post.find({
    $or: [
      { privacy: "public" },
      { privacy: "friends", user: { $in: friendIds } },
    ],
    user: { $ne: userObjectId },
  })
    .populate("user")
    .populate("reactions.user")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

export const getPostById = async (id: string) =>
  Post.findById(id).populate("user").populate("reactions.user").exec();
export const deletePost = async (id: string) => {
  const post = await Post.findByIdAndDelete(id);
  await Comment.deleteMany({ post: id });
  return post;
};
export const updatePost = async (id: string, values: Record<string, any>) => {
  await Post.findByIdAndUpdate(id, values);
};

export const getPostsByUserId = async (
  profileOwnerId: string, // The user whose profile is being viewed
  viewerId: string, // The logged-in user
  page: number,
  limit: number
) => {
  if (
    !mongoose.Types.ObjectId.isValid(profileOwnerId) ||
    !mongoose.Types.ObjectId.isValid(viewerId)
  ) {
    throw new Error("Invalid user ID");
  }

  const skip = (page - 1) * limit;
  const profileOwnerObjectId = new mongoose.Types.ObjectId(profileOwnerId);

  // Check if the viewer is the owner
  const isOwner = profileOwnerId === viewerId;

  // Fetch the profile owner’s user data to check their friends list
  const profileOwner = await User.findById(profileOwnerId)
    .select("friends")
    .exec();
  if (!profileOwner) {
    throw new Error("User not found");
  }

  const isFriend = profileOwner.friends.some(
    (friendId) => friendId.toString() === viewerId
  );

  // Define query conditions
  let conditions: any = { user: profileOwnerObjectId };

  if (!isOwner) {
    conditions.$or = [{ privacy: "public" }];
    if (isFriend) {
      conditions.$or.push({ privacy: "friends" });
    }
  }

  // Fetch filtered posts based on conditions
  return Post.find(conditions)
    .populate("user")
    .populate("reactions.user")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
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
  return Post.findById(post._id)
    .populate("user")
    .populate("reactions.user")
    .exec();
};

export const setAsPrivate = async (postId: string) => {
  return Post.findByIdAndUpdate(postId, { privacy: "private" }, { new: true });
};

export const setAsPublic = async (postId: string) => {
  return Post.findByIdAndUpdate(postId, { privacy: "public" }, { new: true });
};

export const setAsFriendsOnly = async (postId: string) => {
  return Post.findByIdAndUpdate(postId, { privacy: "friends" }, { new: true });
};

export const searchPosts = async (
  search: string,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;

  // Find posts that match the content first
  const contentMatches = await Post.find({
    content: { $regex: new RegExp(search, "i") },
  })
    .populate("user")
    .skip(skip)
    .limit(limit);

  // If we haven't reached the limit, find posts that match the username
  const remainingLimit = limit - contentMatches.length;
  let usernameMatches = <any>[];

  if (remainingLimit > 0) {
    usernameMatches = await Post.find({
      "user.username": { $regex: new RegExp(search, "i") },
      content: { $not: { $regex: new RegExp(search, "i") } }, // Avoid duplicates
    })
      .populate("user")
      .skip(skip)
      .limit(remainingLimit);
  }

  return [...contentMatches, ...usernameMatches];
};

export const countSearchedPosts = async (search: string) => {
  // Count posts that match content
  const contentCount = await Post.countDocuments({
    content: { $regex: new RegExp(search, "i") },
  });

  // Count posts that match username but do not match content
  const usernameCount = await Post.countDocuments({
    "user.username": { $regex: new RegExp(search, "i") },
    content: { $not: { $regex: new RegExp(search, "i") } }, // Avoid double counting
  });

  return contentCount + usernameCount;
};

export const countPostsByUserId = async (
  profileOwnerId: string,
  viewerId: string
) => {
  if (
    !mongoose.Types.ObjectId.isValid(profileOwnerId) ||
    !mongoose.Types.ObjectId.isValid(viewerId)
  ) {
    throw new Error("Invalid user ID");
  }

  const profileOwnerObjectId = new mongoose.Types.ObjectId(profileOwnerId);

  // Check if the viewer is the owner
  const isOwner = profileOwnerId === viewerId;

  // Fetch profile owner's user data to check friendship status
  const profileOwner = await User.findById(profileOwnerId)
    .select("friends")
    .exec();
  if (!profileOwner) {
    throw new Error("User not found");
  }

  const isFriend = profileOwner.friends.some(
    (friendId) => friendId.toString() === viewerId
  );

  // Define query conditions to count only the posts the viewer can see
  let conditions: any = { user: profileOwnerObjectId };

  if (!isOwner) {
    conditions.$or = [{ privacy: "public" }];
    if (isFriend) {
      conditions.$or.push({ privacy: "friends" });
    }
  }

  return Post.countDocuments(conditions);
};
