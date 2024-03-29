import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

export const sendMessageController = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found',
      });
    }

    // Create and save the message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      timestamp: new Date(),
      read: false,
    });
    await message.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      message: {
        sender: senderId,
        receiver: receiverId,
        content,
        timestamp: message.timestamp,
        read: false,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
};

export const getMessageHistoryController = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUserId = req.user._id;

    // Retrieve message history between the authenticated user and the specified user
    const messages = await Message.find({
      $or: [
        { sender: loggedInUserId, receiver: userId },
        { sender: userId, receiver: loggedInUserId },
      ],
    }).sort({ timestamp: 'asc' });

    // Mark messages as read if the receiver is the authenticated user
    messages.forEach(async (message) => {
      if (message.receiver.toString() === loggedInUserId) {
        message.read = true;
        await message.save();
      }
    });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching message history',
      error: error.message,
    });
  }
};