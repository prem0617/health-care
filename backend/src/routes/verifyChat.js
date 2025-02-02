const express = require("express");
const router = express.Router();
const MedicalChat = require("../models/MedicalChat"); // Import the MedicalChat model
const mongoose = require("mongoose");

// Route to fetch all chat history for all users
router.get("/chat-history", async (req, res) => {
  try {
    // Fetch all chat history and populate the userId field with user details (name)
    const chatHistory = await MedicalChat.find().populate("userId", "name"); // Populate the user's name from the User model

    if (!chatHistory || chatHistory.length === 0) {
      return res.status(404).json({ message: "No chat history found." });
    }

    return res.status(200).json({
      message: "Chat history fetched successfully",
      data: chatHistory,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Route to verify chat by updating the 'isChecked' field to true
router.put("/verify-chat/:chatId/:questionId", async (req, res) => {
  try {
    const { chatId, questionId } = req.params;

    console.log(chatId, questionId);

    // Find the medical chat by chatId
    const medicalChat = await MedicalChat.findById(chatId);
    if (!medicalChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Find the specific question in the chat's questions array
    const question = medicalChat.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update the 'isChecked' field to true
    question.isChecked = true;

    // Save the updated medical chat document
    await medicalChat.save();

    return res.status(200).json({
      message: "Chat verified successfully",
      data: medicalChat,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const ChatHistory = require("../models/ChatHistory"); // Assuming you have this model

router.put("/update-answer/:chatId/:questionId", async (req, res) => {
  const { chatId, questionId } = req.params;
  const { answer } = req.body; // The new answer (analysis) to update

  try {
    // Validate the chatId and questionId are valid ObjectIds
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ message: "Invalid questionId" });
    }

    // Find the chat by chatId
    const chat = await MedicalChat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Find the specific question by questionId in the questions array
    const question = chat.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update the answer (aiResponse.analysis)
    question.aiResponse.analysis = answer;

    // Save the updated chat document
    await chat.save();

    res.status(200).json({
      message: "Answer updated successfully",
      data: question,
    });
  } catch (error) {
    console.error("Error updating answer:", error);
    res
      .status(500)
      .json({ message: "Error updating answer", error: error.message });
  }
});

module.exports = router;
