const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Doctor = require("../models/Doctor");
const authMiddleware = require("./middleware/authMiddleware");

router.get("/", authMiddleware, async (req, res) => {
  console.log(req.user);
  const user = req.user;
  res.json(user);
});

router.get("/doctors/:id", authMiddleware, async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ message: "Doctor not found" });
  res.json(doctor);
});

router.get("/users/:id", authMiddleware, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

module.exports = router;
