import { Request, Response } from "express";
import { searchUser, countSearchedUsers } from "../db/users";
import { searchPosts, countSearchedPosts } from "../db/posts";

export const searchUsersHandler = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = 5;
    const total = await countSearchedUsers(search);
    const totalPages = Math.ceil(total / limit);
    if (page > totalPages || page < 1) {
      return res.status(400).json({ error: "Invalid page number" });
    }
    const users = await searchUser(search as unknown as string, page, limit);
    return res.status(200).json({ users, totalPages });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const searchPostsHandler = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = 20;
    const total = await countSearchedPosts(search);
    const totalPages = Math.ceil(total / limit);
    if (page > totalPages || page < 1) {
      return res.status(400).json({ error: "Invalid page number" });
    }
    const posts = await searchPosts(search as unknown as string, page, limit);
    return res.status(200).json({ posts, totalPages });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
