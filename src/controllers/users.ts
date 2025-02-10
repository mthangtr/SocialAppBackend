import { Request, Response } from "express";
import {
  getUserById,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelSentFriendRequest,
  unFriend,
  updateProfile,
  getSuggestedFriends,
} from "../db/users";
import path from "path";

// Handler for retrieving a user’s info by ID.
export const getUserInfoByUserIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = req.params.userId;
    const user = await getUserById(userId);
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Handler for sending a friend request.
export const sendFriendRequestHandler = async (req: Request, res: Response) => {
  const { senderId, receiverId } = req.body;
  try {
    const updatedReceiver = await sendFriendRequest(senderId, receiverId);
    res.status(200).json(updatedReceiver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handler for accepting a friend request.
export const acceptFriendRequestHandler = async (
  req: Request,
  res: Response
) => {
  const { receiverId, senderId } = req.body;
  try {
    const result = await acceptFriendRequest(receiverId, senderId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handler for rejecting a friend request.
export const rejectFriendRequestHandler = async (
  req: Request,
  res: Response
) => {
  const { receiverId, senderId } = req.body;
  try {
    const updatedReceiver = await rejectFriendRequest(receiverId, senderId);
    res.status(200).json(updatedReceiver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handler for canceling a sent friend request.
export const cancelSentFriendRequestHandler = async (
  req: Request,
  res: Response
) => {
  const { senderId, receiverId } = req.body;

  try {
    const updatedReceiver = await cancelSentFriendRequest(senderId, receiverId);
    res.status(200).json(updatedReceiver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handler for retrieving a user’s friends list.
export const getFriendsHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const limit = parseInt(req.query.limit as string);
  try {
    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const friends = limit != 0 ? user.friends.slice(0, limit) : user.friends;
    res.status(200).json(friends);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handler for unfriending a user.
export const unFriendHandler = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const friendId = req.body.friendId;
  try {
    const user = await getUserById(userId);
    const friend = await getUserById(friendId);
    if (!user || !friend)
      return res.status(404).json({ error: "User not found" });
    await unFriend(user, friend);
    const updatedUser = await getUserById(userId);
    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateProfileHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.userId;
    const updateFields = req.body;

    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!updateFields || Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "No update fields provided" });
    }

    // Validate and filter allowed fields before updating
    const allowedFields = ["bio", "username", "pfp", "backgroundImg"];
    const filteredUpdates: Record<string, any> = {};

    Object.keys(updateFields).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updateFields[key];
      }
    });

    if (Object.keys(filteredUpdates).length === 0) {
      return res.status(400).json({ error: "Invalid update fields provided" });
    }

    const updatedUser = await updateProfile(id, filteredUpdates);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const uploadAvatarHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "Không có file nào được tải lên." });
    }

    const fileName = path.basename(req.file.path);
    const avatarUrl = `http://localhost:8080/images/${fileName}`;

    const updatedUser = await updateProfile(userId, { pfp: avatarUrl });

    return res.status(200).json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: "Lỗi khi tải ảnh lên." });
  }
};

export const suggestFriendsHandler = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const suggestedFriends = await getSuggestedFriends(userId, limit);

    return res.status(200).json(suggestedFriends);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
