import express from "express";
import postRoutes from "./posts";
import commentRoutes from "./comments";
import authentication from "./authentication";
import search from "./search";
import user from "./user";

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  postRoutes(router);
  commentRoutes(router);
  search(router);
  user(router);
  return router;
};
