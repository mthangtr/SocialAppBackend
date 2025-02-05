import express from "express";
import {
  createPostHandler,
  getPostsHandler,
  deletePostHandler,
  updatePostHandler,
  getPostsByUserIdHandler,
  serveImage,
  reactToPostHandler,
  setPrivacyHandler,
} from "../controllers/posts";
import { isAuthenticated, isOwner, upload } from "../middlewares";

export default (router: express.Router) => {
  router.post(
    "/posts",
    isAuthenticated,
    upload.array("media", 12),
    createPostHandler
  );
  router.get("/posts/:userId", isAuthenticated, getPostsHandler);
  router.get("/posts/user/:userId", getPostsByUserIdHandler);
  router.delete(
    "/posts/:userId/:id",
    isAuthenticated,
    isOwner,
    deletePostHandler
  );
  router.put("/posts/:userId/:id", isAuthenticated, isOwner, updatePostHandler);
  router.get("/images/:filename", serveImage);
  router.post("/posts/:id/react", isAuthenticated, reactToPostHandler);
  router.patch(
    "/posts/:userId/:id/privacy",
    isAuthenticated,
    isOwner,
    setPrivacyHandler
  );
};
