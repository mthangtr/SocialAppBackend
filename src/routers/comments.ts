import express from "express";
import {
  getCommentsByPost,
  createComment,
  editComment,
  removeComment,
  getTotalCommentsByPost,
  getRepliesByComment,
  reactToCommentHandler,
} from "../controllers/comments";
import { isAuthenticated } from "../middlewares";

export default (router: express.Router) => {
  router.get("/comments/:postId", getCommentsByPost);
  router.post("/comments", isAuthenticated, createComment);
  router.put("/comments/:id", isAuthenticated, editComment);
  router.delete("/comments/:id", isAuthenticated, removeComment);
  router.get("/comments/:postId/total", getTotalCommentsByPost);
  router.get("/comments/:commentId/replies", getRepliesByComment);
  router.patch(
    "/comments/:commentId/react",
    isAuthenticated,
    reactToCommentHandler
  );
};
