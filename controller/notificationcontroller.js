import Notification from "../models/notificationModel.js";


export const createNotification = async (type, sender, recipient, postId) => {
  await Notification.create({ type, sender, recipient, postId });
};

export const getNotifications = async (userId) => {
  return await Notification.find({ recipient: userId }).sort({ createdAt: -1 });
};

export const markNotificationAsRead = async (notificationId) => {
  await Notification.findByIdAndUpdate(notificationId, { read: true });
};
