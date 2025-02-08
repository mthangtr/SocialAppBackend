import { Request, Response } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  updatePost,
  getPostsByUserId,
  reactToPost,
  setAsFriendsOnly,
  setAsPrivate,
  setAsPublic,
  countPostsByUserId,
} from "../db/posts";
import path from "path";
import { CustomRequest } from "../types/typings";

export async function createPostHandler(req: CustomRequest, res: Response) {
  const { content } = req.body;
  const userId = req.identity._id;
  const media = req.files?.map((file) => file.path) || [];

  try {
    const post = await createPost({ user: userId, content, media });
    post.media = post.media.map((filePath) => {
      if (!filePath.startsWith("http://") && !filePath.startsWith("https://")) {
        const fileName = path.basename(filePath);
        return `http://localhost:8080/images/${fileName}`;
      }
      return filePath;
    });
    res.status(201).send(post);
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.error("Error in createPostHandler: ", error);
  }
}

export const getPostsHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = 10;
    const posts = await getPosts(userId, page, limit);
    const updatedPosts = posts.map((post) => {
      post.media = post.media.map((filePath) => {
        if (
          !filePath.startsWith("http://") &&
          !filePath.startsWith("https://")
        ) {
          const fileName = path.basename(filePath);
          return `http://localhost:8080/images/${fileName}`;
        }
        return filePath;
      });
      return post;
    });
    return res.status(200).json(updatedPosts);
  } catch (error) {
    console.log("Error in getPostsHandler: ", error);
    return res.status(400).json({ error: error.message });
  }
};

export const getPostsByUserIdHandler = async (req: Request, res: Response) => {
  try {
    const { userId: profileOwnerId } = req.params;
    const viewerId = req.query.viewerId as string; // Extract viewerId from query params
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = 5;

    if (!viewerId) {
      return res.status(400).json({ error: "Viewer ID is required" });
    }

    const totalPostsOfUser = await countPostsByUserId(profileOwnerId, viewerId);
    const totalPages = Math.ceil(totalPostsOfUser / limit);
    const posts = await getPostsByUserId(profileOwnerId, viewerId, page, limit);

    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: "No posts found for this user" });
    }

    const updatedPosts = posts.map((post) => {
      post.media = post.media.map((filePath) => {
        if (
          !filePath.startsWith("http://") &&
          !filePath.startsWith("https://")
        ) {
          const fileName = path.basename(filePath);
          return `http://localhost:8080/images/${fileName}`;
        }
        return filePath;
      });
      return post;
    });

    return res.status(200).json({ updatedPosts, totalPages });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const deletePostHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deletePost(id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const updatePostHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await updatePost(id, req.body);
    return res.status(200).json(post);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const getPostByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await getPostById(id);
    return res.status(200).json(post);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const serveImage = (req: Request, res: Response) => {
  const { filename } = req.params;
  const imagePath = path.join(
    "D:/Workspace/vscode/FeedsSocialApp/feeds-backend/uploads/",
    filename
  );

  res.sendFile(imagePath, (err) => {
    if (err) {
      res.status(500).send({ error: "File not found." });
    }
  });
};

export const reactToPostHandler = async (req: Request, res: Response) => {
  try {
    const customReq = req as CustomRequest;
    const { id } = req.params;
    const { reaction } = req.body;
    const result = await reactToPost(id, customReq.identity._id, reaction);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const setPrivacyHandler = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { privacy } = req.body;
    switch (privacy) {
      case "public":
        await setAsPublic(postId);
        break;
      case "private":
        await setAsPrivate(postId);
        break;
      case "friends":
        await setAsFriendsOnly(postId);
        break;
      default:
        return res.status(400).json({ error: "Invalid privacy setting" });
    }
    return res.status(200).json({ message: "Privacy setting updated" });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
