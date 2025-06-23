const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const authMiddleware = require("./middleware/authMiddleware");

router.post("/register", async (req, res) => {
  try {
    const { email, password, profile, walletBalance } = req.body;
    console.log("in register");
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password, // Will be hashed by the pre-save middleware
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.mobile,
      },
      wallet: {
        balance: walletBalance || 0, // Default to 0 if not provided
      },
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        dob: user.dateOfBirth,
        role: "USER",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        dob: user.dateOfBirth,
        role: "USER",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Send response
    res.json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error during login",
      error: error.message,
    });
  }
});

router.get("/getUser", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User details fetched successfully",
      token: req.header("Authorization"), // Include the token in response if required
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        wallet: user.wallet,
        appointedDoctors: user.appointedDoctors,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      message: "Error fetching user details",
      error: error.message,
    });
  }
});

router.post("/updateWallet", authMiddleware, async (req, res) => {
  try {
    const { amount, pin } = req.body;
    console.log("Received request:", { amount, pin }); // Debug log

    // Validation
    if (!amount || !pin) {
      return res.status(400).json({ message: "Amount and PIN are required" });
    }

    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update wallet balance
    user.wallet.balance += Number(amount);
    await user.save();

    res.json({
      success: true,
      message: "Wallet updated successfully",
      newBalance: user.wallet.balance,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/doctor/register", async (req, res) => {
  try {
    const { email, password, name, specialization, consultationFee, chatFee } =
      req.body;

    // console.log({
    //   email,
    //   password,
    //   name,
    //   specialization,
    //   consultationFee,
    //   chatFee,
    // });

    const existingDoctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (existingDoctor) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const doctor = new Doctor({
      email: email.toLowerCase(),
      password,
      name,
      specialization,
      consultationFee,
      chatFee,
    });

    await doctor.save();

    const token = jwt.sign(
      {
        userId: doctor._id,
        email: doctor.email,
        specialization: doctor.specialization,
        role: "DOCTOR",
      },
      process.env.JWT_SECRET,

      {
        expiresIn: "24h",
      }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      doctor,
    });
  } catch (error) {
    console.error("Doctor registration error:", error);
    res.status(500).json({
      message: "Error registering doctor",
      error: error.message,
    });
  }
});

router.post("/doctor/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email: email.toLowerCase() });
    if (!doctor) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, doctor.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        userId: doctor._id,
        email: doctor.email,
        specialization: doctor.specialization,
        role: "DOCTOR",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    console.log(token);
    res.json({
      message: "Login successful",
      token,
      doctor,
    });
  } catch (error) {
    console.error("Doctor login error:", error);
    res.status(500).json({
      message: "Error during login",
      error: error.message,
    });
  }
});

module.exports = router;
