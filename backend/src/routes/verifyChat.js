const express = require("express");
const router = express.Router();
const MedicalChat = require("../models/MedicalChat"); // Import the MedicalChat model

// Route to fetch all chat history for all users
router.post("/chat-history", async (req, res) => {
  try {
    const { specialization } = req.body;

    if (!specialization) {
      return res.status(400).json({ message: "Specialization is required" });
    }

    // Fetch all chat history and populate user details
    const chatHistory = await MedicalChat.find().populate("userId");

    // Filter chat history based on specialization inside questions array

    console.log(chatHistory[0].questions.map((chat) => chat.specialization));

    const filteredData = chatHistory[0].questions.filter(
      (chat) => chat.specialization === specialization
    );

    console.log(filteredData);

    return res.status(200).json({
      message: "Filtered chat history fetched successfully",
      data: filteredData,
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
router.put("/verify-chat/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;

    // Find the medical chat containing the question
    const medicalChat = await MedicalChat.findOne({
      "questions._id": questionId,
    });

    if (!medicalChat) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Find and update the specific question
    const question = medicalChat.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update the 'isChecked' field to true
    question.isChecked = true;

    // Save the updated medical chat document
    await medicalChat.save();

    // Return just the updated question
    return res.status(200).json({
      message: "Question verified successfully",
      data: question,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Route to update a question's answer
router.put("/update-answer/:questionId", async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;

    // Find the medical chat containing the question
    const medicalChat = await MedicalChat.findOne({
      "questions._id": questionId,
    });

    if (!medicalChat) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Find and update the specific question
    const question = medicalChat.questions.id(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Update the answer
    question.aiResponse.analysis = answer;

    // Save the updated medical chat document
    await medicalChat.save();

    // Return just the updated question
    return res.status(200).json({
      message: "Answer updated successfully",
      data: question,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
