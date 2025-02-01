const express = require("express");
const { OpenAI } = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/diagnose", async (req, res) => {
  try {
    const { question } = req.body;

    if (
      !question ||
      typeof question !== "string" ||
      question.trim().length < 10
    ) {
      return res.status(400).json({
        error:
          "Please provide a detailed description of your condition (minimum 10 characters)",
      });
    }

    // Create medical prompt
    const prompt = `As a medical AI assistant, please analyze the following condition and provide a professional assessment:
  
      Patient Description: ${question}
  
      Please provide:
      1. Possible conditions
      2. General recommendations
      3. When to seek immediate medical attention
      
      Keep the response clear and concise.`;

    // Get response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // or "gpt-3.5-turbo"
      messages: [
        {
          role: "system",
          content:
            "You are a medical AI assistant providing preliminary medical assessments. Be professional and include necessary medical disclaimers.",
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

    // Send response
    res.status(200).json({
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

module.exports = router;
