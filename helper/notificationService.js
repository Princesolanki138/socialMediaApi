import { createNotification } from "../controller/notificationcontroller.js";

export const followUser = async (currentUser, user) => {
  await createNotification('follower', currentUser, user);
};

export const likePost = async (currentUser, post) => {
  await createNotification('like', currentUser, post.user, post._id);
}

export const commentPost = async (currentUser, post) => {
  await createNotification('comment', currentUser, post.user, post._id);
}
export default followUser;

