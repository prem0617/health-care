// routes/prescriptionRoutes.js
const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");
const Appointment = require("../models/Appointment");
const authMiddleware = require("../routes/middleware/authMiddleware");

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { appointmentId, diagnosis, medications } = req.body;

    // Input validation
    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    if (!diagnosis) {
      return res.status(400).json({ message: "Diagnosis is required" });
    }

    if (
      !medications ||
      !Array.isArray(medications) ||
      medications.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "At least one medication is required" });
    }

    // Validate medication objects
    const isValidMedications = medications.every(
      (med) => med.name && med.dosage && med.frequency && med.duration
    );

    if (!isValidMedications) {
      return res.status(400).json({
        message:
          "Each medication must have name, dosage, frequency, and duration",
      });
    }

    // Fetch the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Verify that the doctor making the request is the same as the appointment's doctor
    if (appointment.doctorId.toString() !== req.user.doctorId) {
      return res.status(403).json({
        message: "Not authorized to create prescription for this appointment",
      });
    }

    // Create the prescription
    const prescription = new Prescription({
      appointmentId,
      doctorId: req.user.doctorId,
      patientId: appointment.patientId,
      diagnosis,
      medications,
    });

    // Save the prescription
    await prescription.save();

    // Update the appointment with the prescription ID
    appointment.prescriptionId = prescription._id;
    await appointment.save();

    res.status(201).json(prescription);
  } catch (error) {
    console.error("Prescription creation error:", error);
    res.status(500).json({
      message: "Error creating prescription",
      error: error.message,
    });
  }
});

module.exports = router;
