import express from "express";
import postRoutes from "./posts";
import commentRoutes from "./comments";
import authentication from "./authentication";
import search from "./search";

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  postRoutes(router);
  commentRoutes(router);
  search(router);
  return router;
};
