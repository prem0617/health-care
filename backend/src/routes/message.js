const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { io, getReceiverSocketId } = require("../socket");

router.post("/", async (req, res) => {
  try {
    const { user, doctor, sender, senderModel, content } = req.body;
    console.log({ user, doctor, sender, senderModel, content });
    if (!user || !doctor || !sender || !senderModel || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const message = await Message.create({
      user,
      doctor,
      sender,
      senderModel,
      content,
    });

    const receiverId = senderModel === "Doctor" ? user : doctor;
    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new-message", message);
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/users/:doctorId", async (req, res) => {
  try {
    const doctorId = req.params.doctorId;

    const chats = await Message.find({ doctor: doctorId }).populate("user");

    // Remove duplicates based on user._id
    const uniqueUsersMap = new Map();

    chats.forEach((chat) => {
      const user = chat.user;
      if (user && !uniqueUsersMap.has(user._id.toString())) {
        uniqueUsersMap.set(user._id.toString(), user);
      }
    });

    const uniqueUsers = Array.from(uniqueUsersMap.values());

    res.json(uniqueUsers);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:userId/:doctorId", async (req, res) => {
  try {
    const { userId, doctorId } = req.params;

    const messages = await Message.find({
      user: userId,
      doctor: doctorId,
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
