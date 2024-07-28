import express from "express";

import {
  register,
  login,
  logout,
  checkSession,
} from "../controllers/authentication";

export default (router: express.Router) => {
  router.post("/auth/register", register);
  router.post("/auth/login", login);
  router.post("/auth/logout", logout);
  router.post("/auth/check-session", checkSession);
};
