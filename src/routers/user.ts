import express from "express";
import {
  getUserInfoByUserIdHandler,
  sendFriendRequestHandler,
  acceptFriendRequestHandler,
  rejectFriendRequestHandler,
  cancelSentFriendRequestHandler,
  listFriendRequestsHandler,
  getFriendsHandler,
  unFriendHandler,
  updateProfileHandler,
  uploadAvatarHandler,
} from "../controllers/users";
import { isAuthenticated, upload } from "../middlewares";

export default (router: express.Router) => {
  router.get("/users/:userId", getUserInfoByUserIdHandler);
  router.post(
    "/users/:userId/send-friend-request",
    isAuthenticated,
    sendFriendRequestHandler
  );
  router.post(
    "/users/:userId/accept-friend-request",
    isAuthenticated,
    acceptFriendRequestHandler
  );
  router.post(
    "/users/:userId/reject-friend-request",
    isAuthenticated,
    rejectFriendRequestHandler
  );
  router.post(
    "/users/:userId/cancel-sent-friend-request",
    isAuthenticated,
    cancelSentFriendRequestHandler
  );
  router.get(
    "/users/:userId/friend-requests",
    isAuthenticated,
    listFriendRequestsHandler
  );
  router.get("/users/:userId/friends", isAuthenticated, getFriendsHandler);
  router.post("/users/:userId/unfriend", isAuthenticated, unFriendHandler);
  router.patch(
    "/users/:userId/update-profile",
    isAuthenticated,
    updateProfileHandler
  );
  router.put(
    "/users/:userId/avatar",
    upload.single("avatar"),
    uploadAvatarHandler
  );
};
