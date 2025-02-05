import { Request, Response } from "express";
import { searchUser } from "../db/users";
import { searchPosts } from "../db/posts";

export const searchUsersHandler = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = 20;
    const users = await searchUser(search as unknown as string, page, limit);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

export const searchPostsHandler = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = 20;
    const results = await searchPosts(search as unknown as string, page, limit);
    return res.status(200).json(results);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
