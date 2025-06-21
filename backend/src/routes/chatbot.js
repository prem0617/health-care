const express = require("express");
const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const MedicalChat = require("../models/MedicalChat");
const Specialization = require("../models/Specialization");

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/diagnose", async (req, res) => {
  try {
    const { userId, question } = req.body;

    console.log({ userId, question });

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid or missing user ID." });
    }

    const specializations = await Specialization.find();
    console.log(specializations);
    const specializationNames = specializations
      .map((spec) => spec.name)
      .join(", ");

    if (
      !question ||
      typeof question !== "string" ||
      question.trim().length < 10
    ) {
      return res.status(400).json({
        error:
          "Please provide a detailed description of your condition (minimum 10 characters).",
      });
    }

    // First, determine the specialization
    const specializationPrompt = `Given the following medical question/condition, determine which medical specialization would be most appropriate from this list: ${specializationNames}. 
    Only respond with one of the exact specialization names listed, nothing else.
    
    Question: ${question}`;

    console.log(specializationNames);

    const specializationCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a medical triage assistant that categorizes medical conditions into specializations. Respond only with the exact specialization name.",
        },
        {
          role: "user",
          content: specializationPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    const determinedSpecialization =
      specializationCompletion.choices[0]?.message?.content
        .toLowerCase()
        .trim();
    console.log(determinedSpecialization);
    // Validate the determined specialization exists in our database
    const isValidSpecialization = specializations.some(
      (spec) => spec.name.toLowerCase() === determinedSpecialization
    );

    if (!isValidSpecialization) {
      return res.status(400).json({
        error: "Could not determine appropriate medical specialization.",
      });
    }

    // Create medical prompt with specialization context
    const prompt = `As a medical AI assistant specializing in ${determinedSpecialization}, please analyze the following condition and provide a professional assessment:
  
    Patient Description: ${question}

    Please provide:
    1. Possible conditions within the field of ${determinedSpecialization}
    2. Specific recommendations related to ${determinedSpecialization}
    3. When to seek immediate medical attention
    4. Relevant specialist referral considerations
    
    Keep the response clear, concise, and focused on ${determinedSpecialization}-related aspects.`;

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a medical AI assistant with expertise in ${determinedSpecialization}. Provide preliminary medical assessments while including necessary medical disclaimers.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response =
      completion.choices[0]?.message?.content || "No response generated";

    // Save question and response in the database
    let medicalChat = await MedicalChat.findOne({ userId });

    if (!medicalChat) {
      medicalChat = new MedicalChat({ userId, questions: [] });
    }

    medicalChat.questions.push({
      specialization: determinedSpecialization,
      question,
      aiResponse: {
        analysis: response,
      },
    });

    await medicalChat.save();

    // Send response
    res.status(200).json({
      specialization: determinedSpecialization,
      analysis: response,
      disclaimer:
        "This is an AI-generated response and should not replace professional medical advice. If you have serious concerns, please consult a healthcare provider.",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      error: "Error processing request",
      message: error.message,
    });
  }
});

router.get("/chats/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID format." });
    }

    // Fetch user's chat history
    const userChats = await MedicalChat.findOne({ userId });

    if (!userChats) {
      return res
        .status(404)
        .json({ message: "No chat history found for this user." });
    }

    res.status(200).json({
      userId,
      chatHistory: userChats.questions, // Send all questions and answers
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
});

module.exports = router;
