const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const authMiddleware = require("./middleware/authMiddleware");

// Get all doctors (public route - no auth needed)
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.find().select(
      "name specialization consultationFee chatFee"
    ); // Only select needed fields

    res.json({
      message: "Doctors retrieved successfully",
      doctors,
    });
  } catch (error) {
    console.error("Fetch doctors error:", error);
    res.status(500).json({
      message: "Error fetching doctors",
      error: error.message,
    });
  }
});

// Get single doctor by ID
router.get("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select(
      "name specialization consultationFee firstTimeDiscount _id"
    ); // Exclude version key

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({
      message: "Doctor retrieved successfully",
      doctor,
    });
  } catch (error) {
    console.error("Fetch doctor error:", error);
    res.status(500).json({
      message: "Error fetching doctor",
      error: error.message,
    });
  }
});

// Optional: Search doctors by specialization or name
router.get("/search", async (req, res) => {
  try {
    const { specialization, name } = req.query;
    let query = {};

    if (specialization) {
      query.specialization = new RegExp(specialization, "i");
    }
    if (name) {
      query.name = new RegExp(name, "i");
    }

    const doctors = await Doctor.find(query).select(
      "name specialization consultationFee firstTimeDiscount"
    );

    res.json({
      message: "Search results retrieved successfully",
      doctors,
    });
  } catch (error) {
    console.error("Search doctors error:", error);
    res.status(500).json({
      message: "Error searching doctors",
      error: error.message,
    });
  }
});

module.exports = router;
