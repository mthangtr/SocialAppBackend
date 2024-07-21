import express from "express";

import { getUserByEmail, createUser } from "../db/users";
import { random, authentication } from "../helpers";

const usernameGenerator = (email: string) => email.split("@")[0];

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "Invalid gmail or passwords" });
    }

    if (
      authentication(user.authentication.salt, password) !==
      user.authentication.password
    ) {
      return res.status(401).json({ error: "Invalid gmail or passwords" });
    }

    const salt = random();

    user.authentication.sessionToken = authentication(salt, user.id.toString());

    await user.save();

    res.cookie("sessionToken", user.authentication.sessionToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json(user).end();
  } catch (error) {
    console.error("Error on login", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = random();
    const user = await createUser({
      email,
      username: username || usernameGenerator(email),
      authentication: {
        password: authentication(salt, password),
        salt,
      },
    });

    return res.status(201).json(user);
  } catch (error) {
    console.error("Error on register", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  try {
    res.clearCookie("sessionToken", { domain: "localhost", path: "/" });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error on logout", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
