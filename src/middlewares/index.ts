import express from "express";
import { get, merge } from "lodash";
import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { getUserBySessionToken } from "../db/users";

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["sessionToken"];
    const userId = get(req, "params.userId");
    if (!sessionToken) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const user = await getUserBySessionToken(sessionToken);

    if (!user) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    if (user.id !== userId) {
      return res.status(403).send({ error: "Forbidden" });
    }

    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).send({ error: "Unauthorized" });
  }
};

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["sessionToken"];

    if (!sessionToken) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    const user = await getUserBySessionToken(sessionToken);

    if (!user) {
      return res.status(401).send({ error: "Unauthorized" });
    }

    merge(req, { identity: user });

    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).send({ error: "Unauthorized" });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "D:/Workspace/vscode/FeedsSocialApp/feeds-backend/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});

export const upload = multer({ storage });
