const mongoose = require("mongoose");

const medicalChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
        minlength: 10,
      },
      aiResponse: {
        analysis: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
      isChecked: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const MedicalChat = mongoose.model("MedicalChat", medicalChatSchema);

module.exports = MedicalChat;
