import { Request, Response } from "express";
import { CustomRequest } from "../types/typings";
import {
  addComment,
  getCommentsByPostId,
  getRepliesByCommentId,
  countRepliesByCommentId,
  countCommentsByPostId,
  updateComment,
  deleteComment,
  reactToComment,
} from "../db/comments";

export const getCommentsByPost = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 6;
    const comments = await getCommentsByPostId(req.params.postId, page, limit);
    const totalComments = await countCommentsByPostId(req.params.postId);

    const hasMore = totalComments > page * limit;

    res.json({ comments, hasMore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRepliesByComment = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 2;
    const replies = await getRepliesByCommentId(
      req.params.commentId,
      page,
      limit
    );
    const totalReplies = await countRepliesByCommentId(req.params.commentId);

    const hasMoreReplies = totalReplies > page * limit;

    res.json({ replies, hasMoreReplies });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTotalCommentsByPost = async (req: Request, res: Response) => {
  try {
    const totalComments = await countCommentsByPostId(req.params.postId);
    res.json({ totalComments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createComment = async (req: Request, res: Response) => {
  const { user, post, content, parent } = req.body;

  if (!user || !post || !content) {
    return res
      .status(400)
      .json({ error: "Missing required fields: user, post, or content." });
  }

  try {
    const comment = await addComment({ user, post, content, parent });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const editComment = (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    return res
      .status(400)
      .json({ error: "Content is required for updating a comment." });
  }
  updateComment(id, { content, updatedAt: new Date() })
    .then((updatedComment) => {
      if (!updatedComment) {
        return res.status(404).json({ error: "Comment not found." });
      }
      res.status(200).json(updatedComment);
    })
    .catch((err) => res.status(500).json({ error: err.message }));
};

export const removeComment = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const removedComment = await deleteComment(id);
    if (!removedComment) {
      return res.status(404).json({ error: "Comment not found." });
    }
    res.status(200).json(removedComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const reactToCommentHandler = async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;

    // Convert the "req" to your custom type that has "identity"
    const customReq = req as CustomRequest;

    // Now read user ID from customReq.identity
    const userId = customReq.identity?._id;
    const { reaction } = req.body; // destructure from body

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const updatedComment = await reactToComment(
      commentId,
      userId.toString(),
      reaction
    );
    return res.json(updatedComment);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
