require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const { app, server } = require("./socket");

// Middleware
const corsOptions = {
  origin: ["http://localhost:5173", "https://chikitsahub.vercel.app"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection with proper options
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Import routes
const authRoutes = require("./routes/auth");
const appointmentRoutes = require("./routes/appointments");
const transactionRoutes = require("./routes/transactions");
const DoctorRoutes = require("./routes/doctor");
const chatbotRoutes = require("./routes/chatbot");
const verifyChat = require("./routes/verifyChat");
const prescriptionRoutes = require("./routes/prescription");
const specializationRoutes = require("./routes/specializationRoutes");
const messageRoutes = require("./routes/message");
const userRoutes = require("./routes/user");

// Use routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/doctor", DoctorRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/verifyChat", verifyChat);
app.use("/api/prescription", prescriptionRoutes);
app.use("/api/specialization", specializationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/user", userRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
