import express from "express";
import postRoutes from "./posts";
import authentication from "./authentication";

const router = express.Router();

export default (): express.Router => {
  authentication(router);
  postRoutes(router);
  return router;
};
