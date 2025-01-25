const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const User = require("../models/User");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("User:", req.user?._id);
  next();
});

// Get all messages for a user (conversations)
router.get("/", auth, async (req, res) => {
  try {
    console.log("Fetching messages for user:", req.user._id.toString());

    // Get all messages where the user is either sender or recipient
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    })
      .populate("sender", "name email profilePicture")
      .populate("recipient", "name email profilePicture")
      .sort({ createdAt: -1 });

    console.log("Found messages:", messages.length);

    // Group messages by conversation
    const conversations = messages.reduce((acc, message) => {
      const otherUser =
        message.sender._id.toString() === req.user._id.toString()
          ? message.recipient
          : message.sender;

      const conversationId = otherUser._id.toString();

      if (!acc[conversationId]) {
        acc[conversationId] = {
          user: otherUser,
          messages: [],
        };
      }

      acc[conversationId].messages.push(message);
      return acc;
    }, {});

    res.json(Object.values(conversations));
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "Error fetching messages", error: error.message });
  }
});

// Get conversation with a specific user
router.get("/:userId", auth, async (req, res) => {
  try {
    console.log("Fetching conversation with user:", req.params.userId);

    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id },
      ],
    })
      .populate("sender", "name email profilePicture")
      .populate("recipient", "name email profilePicture")
      .sort({ createdAt: 1 });

    console.log("Found messages:", messages.length);

    res.json({
      user: otherUser,
      messages,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res
      .status(500)
      .json({ message: "Error fetching conversation", error: error.message });
  }
});

// Send a message
router.post("/", auth, async (req, res) => {
  try {
    // Debug log the entire request
    console.log("Message creation request:", {
      user: req.user?._id?.toString(),
      body: req.body,
      headers: req.headers,
      auth: !!req.user,
    });

    // Verify user is authenticated
    if (!req.user?._id) {
      console.error("User not authenticated");
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Validate input
    if (!req.body.content || !req.body.recipientId) {
      console.error("Invalid message content");
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.body.recipientId)) {
      console.error("Invalid recipient ID format:", req.body.recipientId);
      return res.status(400).json({ message: "Invalid recipient ID" });
    }

    // Debug log the IDs
    console.log("IDs check:", {
      senderId: req.user._id.toString(),
      recipientId: req.body.recipientId,
      senderIdValid: mongoose.Types.ObjectId.isValid(req.user._id),
      recipientIdValid: mongoose.Types.ObjectId.isValid(req.body.recipientId),
    });

    // Verify recipient exists
    const recipient = await User.findById(req.body.recipientId);
    if (!recipient) {
      console.error("Recipient not found:", req.body.recipientId);
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Debug log the recipient
    console.log("Recipient found:", {
      id: recipient._id.toString(),
      name: recipient.name,
      email: recipient.email,
    });

    // Create message document
    const messageData = {
      content: req.body.content,
      sender: req.user._id,
      recipient: req.body.recipientId,
    };

    console.log("Creating message with data:", {
      ...messageData,
      sender: messageData.sender.toString(),
      recipient: messageData.recipient.toString(),
    });

    // Create and save the message
    const message = await Message.create(messageData);

    console.log("Message created:", message._id.toString());

    // Populate sender and recipient details
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email profilePicture")
      .populate("recipient", "name email profilePicture");

    if (!populatedMessage) {
      console.error("Failed to populate message");
      return res
        .status(500)
        .json({ message: "Failed to populate message details" });
    }

    console.log("Message populated successfully:", {
      id: populatedMessage._id.toString(),
      sender: populatedMessage.sender?._id?.toString(),
      recipient: populatedMessage.recipient?._id?.toString(),
      content: populatedMessage.content,
    });

    // Emit socket event if socket.io is set up
    const io = req.app.get("io");
    if (io) {
      io.to(req.body.recipientId).emit("newMessage", populatedMessage);
      console.log("Socket event emitted to:", req.body.recipientId);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error creating message:", {
      error: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      kind: error.kind,
      value: error.value,
      path: error.path,
      user: req.user?._id?.toString(),
    });

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format",
        field: error.path,
        value: error.value,
      });
    }

    res.status(500).json({
      message: error.message || "Error sending message",
      details:
        process.env.NODE_ENV === "development"
          ? {
              error: error.message,
              stack: error.stack,
              code: error.code,
              kind: error.kind,
              user: req.user?._id?.toString(),
            }
          : undefined,
    });
  }
});

// Mark messages as read
router.patch("/read/:senderId", auth, async (req, res) => {
  try {
    console.log("Marking messages as read from sender:", req.params.senderId);

    if (!mongoose.Types.ObjectId.isValid(req.params.senderId)) {
      return res.status(400).json({ message: "Invalid sender ID" });
    }

    const result = await Message.updateMany(
      {
        sender: req.params.senderId,
        recipient: req.user._id,
        read: false,
      },
      {
        read: true,
      }
    );

    console.log("Messages marked as read:", result.modifiedCount);

    res.json({
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res
      .status(500)
      .json({
        message: "Error marking messages as read",
        error: error.message,
      });
  }
});

module.exports = router;
