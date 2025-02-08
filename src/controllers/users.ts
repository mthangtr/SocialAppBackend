import { Request, Response } from "express";
import {
  getUserById,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelSentFriendRequest,
  listFriendRequests,
  getFriends,
  unFriend,
  updateProfile,
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

// Handler for listing all incoming friend requests for a user.
export const listFriendRequestsHandler = async (
  req: Request,
  res: Response
) => {
  const { userId } = req.params;
  try {
    const friendRequests = await listFriendRequests(userId);
    res.status(200).json(friendRequests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handler for retrieving a user’s friends list.
export const getFriendsHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const friends = await getFriends(userId);
    res.status(200).json(friends);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Handler for unfriending a user.
export const unFriendHandler = async (req: Request, res: Response) => {
  const { userId, friendId } = req.body;
  try {
    const result = await unFriend(userId, friendId);
    res.status(200).json(result);
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
