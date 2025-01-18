import express from "express";
import {
  getCommentsByPost,
  getOnly2CommentsByPost,
  createComment,
  editComment,
  removeComment,
  getTotalCommentsByPost,
} from "../controllers/comments";
import { isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  router.get("/comments/:postId", getCommentsByPost);
  router.get("/comments/:postId/limit2", getOnly2CommentsByPost);
  router.post("/comments", isAuthenticated, createComment);
  router.put("/comments/:id", isAuthenticated, editComment);
  router.delete("/comments/:id", isAuthenticated, removeComment);
  router.get("/comments/:postId/total", getTotalCommentsByPost);
};
