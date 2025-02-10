import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    pfp: {
      type: String,
      default:
        "https://www.google.com/url?sa=i&url=https%3A%2F%2Fen.m.wikipedia.org%2Fwiki%2FFile%3ADefault_pfp.svg&psig=AOvVaw1WH_E7FUZ2Kx-cqlvrIlLy&ust=1716822188864000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCJDCj5XLq4YDFQAAAAAdAAAAABA9",
    },
    backgroundImg: { type: String, default: "" },
    bio: { type: String, default: "" },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    authentication: {
      password: { type: String, required: true, select: false },
      salt: { type: String, select: false },
      sessionToken: { type: String, select: false },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
export const getUsers = async () => User.find();
export const getUserByEmail = async (email: string) => {
  return User.findOne({ email })
    .select("+authentication.salt +authentication.password")
    .populate("friends")
    .populate("friendRequests");
};
export const getUserByUsername = async (username: string) =>
  User.findOne({ username });
export const getUserById = async (userId: string) => {
  return User.findById(userId).populate("friends").populate("friendRequests");
};
export const getUserBySessionToken = async (sessionToken: string) =>
  User.findOne({ "authentication.sessionToken": sessionToken });
export const createUser = async (values: Record<string, any>) =>
  new User(values).save().then((user) => user.toObject());
export const deleteUser = async (id: string) => User.findByIdAndDelete(id);
export const updateUser = async (id: string, values: Record<string, any>) =>
  User.findByIdAndUpdate(id, values);

export const searchUser = async (
  search: string,
  page: number,
  limit: number
) => {
  const skip = (page - 1) * limit;
  return User.find({
    username: { $regex: new RegExp(search, "i") },
  })
    .skip(skip)
    .limit(limit);
};
export const countSearchedUsers = async (search: string) => {
  return User.countDocuments({
    username: { $regex: new RegExp(search, "i") },
  });
};

/**
 * Friend Request Operations
 */

// Send a friend request (adds the sender’s ID to the receiver’s friendRequests array)
export const sendFriendRequest = async (
  senderId: string,
  receiverId: string
) => {
  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);
  if (!sender || !receiver) {
    throw new Error("User not found");
  }
  // Avoid duplicates by checking if a request already exists.
  if (receiver.friendRequests.some((id) => id.toString() === senderId)) {
    throw new Error("Friend request already sent");
  }
  receiver.friendRequests.push(new mongoose.Types.ObjectId(senderId));
  await receiver.save();
  return receiver;
};

// Accept a friend request (adds each user to the other’s friends array and removes the request)
export const acceptFriendRequest = async (
  receiverId: string,
  senderId: string
) => {
  const sender = await User.findById(senderId);
  const receiver = await User.findById(receiverId);

  if (!sender || !receiver) {
    throw new Error("User not found");
  }

  // Kiểm tra xem friend request có tồn tại không
  if (!receiver.friendRequests.some((id) => id?.toString() === senderId)) {
    throw new Error("No friend request found");
  }

  // Thêm bạn bè nếu chưa có trong danh sách
  if (!receiver.friends.some((id) => id.toString() === senderId)) {
    receiver.friends.push(sender._id);
  }
  if (!sender.friends.some((fr) => fr.toString() === receiverId)) {
    sender.friends.push(receiver._id);
  }

  // Xóa request đã chấp nhận
  receiver.friendRequests = receiver.friendRequests.filter(
    (id) => id.toString() !== senderId
  );

  await receiver.save();
  await sender.save();

  // Populate lại danh sách bạn bè với đầy đủ thông tin
  const updatedReceiver = await User.findById(receiverId).populate({
    path: "friends",
    select: "_id username email pfp backgroundImg bio",
  });

  return { sender, receiver: updatedReceiver };
};

// Reject a friend request (simply removes the request from the receiver’s friendRequests)
export const rejectFriendRequest = async (
  receiverId: string,
  senderId: string
) => {
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new Error("User not found");
  }
  if (!receiver.friendRequests.some((id) => id.toString() === senderId)) {
    throw new Error("No friend request found");
  }
  receiver.friendRequests = receiver.friendRequests.filter(
    (id) => id.toString() !== senderId
  );
  await receiver.save();
  return receiver;
};

// Cancel a sent friend request (removes the sender’s ID from the receiver’s friendRequests)
export const cancelSentFriendRequest = async (
  senderId: string,
  receiverId: string
) => {
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new Error("Receiver not found");
  }
  if (!receiver.friendRequests.some((id) => id.toString() === senderId)) {
    throw new Error("Friend request not found");
  }
  receiver.friendRequests = receiver.friendRequests.filter(
    (id) => id.toString() !== senderId
  );
  await receiver.save();
  return receiver;
};

export const unFriend = async (
  user: mongoose.Document & { friends: mongoose.Types.ObjectId[] },
  friend: mongoose.Document & { friends: mongoose.Types.ObjectId[] }
) => {
  // Remove the friend from user's friends list
  user.updateOne({ $pull: { friends: friend._id } }).exec();

  // Remove the user from friend's friends list
  friend.updateOne({ $pull: { friends: user._id } }).exec();

  await user.save();
  await friend.save();

  return { user, friend };
};

export const updateProfile = async (
  id: string,
  values: Record<string, any>
) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error("User not found");
  }

  // Prevent duplicate usernames
  if (values.username) {
    const existingUser = await User.findOne({ username: values.username });
    if (existingUser && existingUser._id.toString() !== id) {
      throw new Error("Username is already taken.");
    }
  }

  // Use `$set` to update only the provided fields
  return User.findByIdAndUpdate(
    id,
    { $set: values },
    { new: true, runValidators: true }
  );
};
