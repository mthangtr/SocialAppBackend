import { Request, Response } from "express";
import {
  createPost,
  getPosts,
  getPostById,
  deletePost,
  updatePost,
  getPostsByUserId,
  reactToPost,
} from "../db/posts";
import path from "path";

interface CustomRequest extends Request {
  identity: any;
  files: Express.Multer.File[];
}

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
  }
}

export const getPostsHandler = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = 10;

    const posts = await getPosts(page, limit);
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

export const getPostsByUserIdHandler = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;
    const posts = await getPostsByUserId(userId);

    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: "No posts found for this user" });
    }

    return res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts by user ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const serveImage = (req: Request, res: Response) => {
  const { filename } = req.params;
  const imagePath = path.join(
    "D:/Workspace/vscode/FeedsSocialApp/feeds-backend/sources",
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
