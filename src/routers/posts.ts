import express from "express";
import {
  createPostHandler,
  getPostsHandler,
  deletePostHandler,
  updatePostHandler,
  getPostsByUserIdHandler,
  serveImage,
  reactToPostHandler,
} from "../controllers/posts";
import { isAuthenticated, isOwner, upload } from "../middlewares";

export default (router: express.Router) => {
  router.post(
    "/posts",
    isAuthenticated,
    upload.array("media", 12),
    createPostHandler
  );
  router.get("/posts", isAuthenticated, getPostsHandler);
  router.get("/posts/user/:userId", getPostsByUserIdHandler);
  router.delete("/posts/:id", isAuthenticated, isOwner, deletePostHandler);
  router.put("/posts/:id", isAuthenticated, isOwner, updatePostHandler);
  router.get("/images/:filename", serveImage);
  router.post("/posts/:id/react", isAuthenticated, reactToPostHandler);
};
