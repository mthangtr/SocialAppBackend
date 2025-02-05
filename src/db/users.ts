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
  return User.findOne({ email }).select(
    "+authentication.salt +authentication.password"
  );
};
export const getUserByUsername = async (username: string) =>
  User.findOne({ username });
export const getUserById = async (id: string) => User.findById(id);
export const getUserBySessionToken = async (sessionToken: string) =>
  User.findOne({ "authentication.sessionToken": sessionToken });
export const createUser = async (values: Record<string, any>) =>
  new User(values).save().then((user) => user.toObject());
export const deleteUser = async (id: string) => User.findByIdAndDelete(id);
export const updateUser = async (id: string, values: Record<string, any>) =>
  User.findByIdAndUpdate(id, values);
