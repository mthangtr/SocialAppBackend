import express from "express";

import { searchUsersHandler, searchPostsHandler } from "../controllers/search";

export default (router: express.Router) => {
  router.get("/search/users", searchUsersHandler);
  router.get("/search", searchPostsHandler);
};
