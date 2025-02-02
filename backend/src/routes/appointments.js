// routes/appointments.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("./middleware/authMiddleware");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const mongoose = require("mongoose");
const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const Prescription = require("../models/Prescription");

dotenv.config();

function calculatePayment(doctor, isFirstConsultation) {
  const payment = {
    originalAmount: doctor.consultationFee.amount,
    currency: doctor.consultationFee.currency,
    discountApplied: 0,
    finalAmount: doctor.consultationFee.amount,
  };

  if (isFirstConsultation && doctor.firstTimeDiscount) {
    payment.discountApplied = Math.min(
      (doctor.consultationFee.amount * doctor.firstTimeDiscount.percentage) /
        100,
      doctor.firstTimeDiscount.maxAmount
    );
    payment.finalAmount = payment.originalAmount - payment.discountApplied;
  }

  return payment;
}

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { doctorId, date, slot } = req.body;
    const patientId = req.user.userId;

    // Basic validations
    const [doctor, user] = await Promise.all([
      Doctor.findById(doctorId),
      User.findById(patientId),
    ]);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check for slot availability
    const appointmentDate = new Date(date);
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      date: appointmentDate,
      "slot.startTime": slot.startTime,
      "slot.endTime": slot.endTime,
      status: { $ne: "cancelled" },
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        message: "Slot not available",
        conflictingTimeSlot: {
          date: appointmentDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      });
    }

    // Check if first consultation
    const isFirstConsultation = !user.appointedDoctors.includes(doctorId);
    const payment = calculatePayment(doctor, isFirstConsultation);

    // Check wallet balance
    if (user.wallet.balance < payment.finalAmount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    // Create and save appointment
    const appointment = new Appointment({
      doctorId,
      patientId,
      date: appointmentDate,
      slot,
      payment,
      isFirstConsultation,
    });
    await appointment.save();

    // Create and save transaction
    const transaction = new Transaction({
      userId: patientId,
      doctorId: doctorId,
      appointmentId: appointment._id,
      type: "appointment_payment",
      amount: payment.finalAmount,
      currency: payment.currency,
      status: "completed",
      metadata: {
        discountApplied: payment.discountApplied,
        originalAmount: payment.originalAmount,
      },
    });
    await transaction.save();

    // Update user wallet and appointedDoctors
    user.wallet.balance -= payment.finalAmount;
    if (isFirstConsultation) {
      user.appointedDoctors.push(doctorId);
    }
    await user.save();

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
      transaction,
    });
  } catch (error) {
    console.error("Appointment booking error:", error);
    res.status(500).json({
      message: "Error creating appointment",
      error: error.message,
    });
  }
});

// Get appointments
// Patient route
router.get("/my-appointments", authMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Query params for filtering
    const status = req.query.status; // 'scheduled', 'completed', 'cancelled'
    const fromDate = req.query.fromDate;
    const toDate = req.query.toDate;

    // Build query object
    let query = { patientId: req.user.userId };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add date range filter if provided
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate);
    }

    // Get appointments with pagination
    const appointments = await Appointment.find(query)
      .sort({ date: -1, "slot.startTime": -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "doctorId",
        select: "name specialization consultationFee firstTimeDiscount",
      })
      .lean();

    // Get total count for pagination
    const totalAppointments = await Appointment.countDocuments(query);

    // Calculate total pages
    const totalPages = Math.ceil(totalAppointments / limit);

    // Add additional booking-related information
    const enhancedAppointments = appointments.map((appointment) => ({
      ...appointment,
      isPast: new Date(appointment.date) < new Date(),
      canCancel:
        appointment.status === "scheduled" &&
        new Date(appointment.date) > new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      canReschedule:
        appointment.status === "scheduled" &&
        new Date(appointment.date) > new Date(Date.now() + 24 * 60 * 60 * 1000),
    }));

    res.json({
      message: "Appointments retrieved successfully",
      data: {
        appointments: enhancedAppointments,
        pagination: {
          currentPage: page,
          totalPages,
          totalAppointments,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Fetch appointments error:", error);
    res.status(500).json({
      message: "Error fetching appointments",
      error: error.message,
    });
  }
});
router.get("/doctor/:doctorId", async (req, res) => {
  try {
    const { doctorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { doctorId };
    const currentDate = new Date();

    const upcomingQuery = { ...query, date: { $gte: currentDate } };
    const previousQuery = { ...query, date: { $lt: currentDate } };

    const [upcomingAppointments, previousAppointments, totalAppointments] =
      await Promise.all([
        Appointment.find(upcomingQuery)
          .sort({ date: 1, "slot.startTime": 1 }) // Sort upcoming appointments in ascending order
          .skip(skip)
          .limit(limit)
          .populate("patientId", "name email profile")
          .lean(),
        Appointment.find(previousQuery)
          .sort({ date: -1, "slot.startTime": -1 }) // Sort previous appointments in descending order
          .skip(skip)
          .limit(limit)
          .populate("patientId", "name email profile")
          .lean(),
        Appointment.countDocuments(query),
      ]);

    res.json({
      message: "Appointments retrieved successfully",
      data: {
        upcomingAppointments,
        previousAppointments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalAppointments / limit),
          totalAppointments,
          hasNextPage: page < Math.ceil(totalAppointments / limit),
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Fetch doctor appointments error:", error);
    res
      .status(500)
      .json({ message: "Error fetching appointments", error: error.message });
  }
});

router.post("/:appointmentId/zoom-link", authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { zoomLink } = req.body;
    const doctorId = req.user.doctorId;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId,
      status: "scheduled",
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Appointment not found or not authorized" });
    }

    appointment.zoomLink = zoomLink;
    await appointment.save();

    res.json({
      message: "Zoom link added successfully",
      appointment,
    });
  } catch (error) {
    console.error("Add zoom link error:", error);
    res.status(500).json({
      message: "Error adding zoom link",
      error: error.message,
    });
  }
});

// Create prescription for appointment (Doctor only)
router.post(
  "/:appointmentId/prescription",
  authMiddleware,
  async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const { diagnosis, medications, physicalActivities, notes } = req.body;
      const doctorId = req.user.doctorId;

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctorId,
      });

      if (!appointment) {
        return res
          .status(404)
          .json({ message: "Appointment not found or not authorized" });
      }

      if (appointment.prescriptionId) {
        return res.status(400).json({
          message: "Prescription already exists for this appointment",
        });
      }

      const prescription = new Prescription({
        appointmentId,
        doctorId,
        patientId: appointment.patientId,
        diagnosis,
        medications,
        physicalActivities,
        notes,
      });

      await prescription.save();

      // Update appointment with prescription ID
      appointment.prescriptionId = prescription._id;
      await appointment.save();

      res.status(201).json({
        message: "Prescription created successfully",
        prescription,
      });
    } catch (error) {
      console.error("Create prescription error:", error);
      res.status(500).json({
        message: "Error creating prescription",
        error: error.message,
      });
    }
  }
);

// Format prescription goals using OpenAI (Doctor only)
router.post(
  "/:appointmentId/format-goals",
  authMiddleware,
  async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const doctorId = req.user.doctorId;

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctorId,
      }).populate("prescriptionId");

      if (!appointment || !appointment.prescriptionId) {
        return res
          .status(404)
          .json({ message: "Appointment or prescription not found" });
      }

      const prescription = appointment.prescriptionId;

      // Prepare data for OpenAI
      const activitiesPrompt = `
            Please convert these medical activities into structured goals with specific frequency and duration:
            
            Physical Activities:
            ${prescription.physicalActivities.join("\n")}
            
            Medications:
            ${prescription.medications
              .map(
                (med) =>
                  `- ${med.name}: ${med.dosage}, ${med.frequency}, for ${med.duration}`
              )
              .join("\n")}
            
            Format each goal as an object with activity, frequency, and duration fields.
        `;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Convert medical prescriptions into structured, actionable goals.",
          },
          {
            role: "user",
            content: activitiesPrompt,
          },
        ],
      });

      // Parse and format the goals
      const formattedGoals = JSON.parse(completion.choices[0].message.content);
      prescription.formattedGoals = formattedGoals;
      prescription.isFormatted = true;
      await prescription.save();

      res.json({
        message: "Goals formatted successfully",
        prescription,
      });
    } catch (error) {
      console.error("Format goals error:", error);
      res.status(500).json({
        message: "Error formatting goals",
        error: error.message,
      });
    }
  }
);

// Get appointment details with prescription
router.get("/:appointmentId", authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.userId;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      $or: [{ patientId: userId }, { doctorId: userId }],
    })
      .populate("doctorId", "name specialization consultationFee")
      .populate("patientId", "profile")
      .populate("prescriptionId")
      .lean();

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Appointment not found or not authorized" });
    }

    // Add additional fields
    appointment.isPast = new Date(appointment.date) < new Date();
    appointment.canCancel =
      appointment.status === "scheduled" &&
      new Date(appointment.date) > new Date(Date.now() + 24 * 60 * 60 * 1000);
    appointment.canAddPrescription =
      userId === appointment.doctorId._id.toString() &&
      !appointment.prescriptionId &&
      appointment.status === "completed";

    res.json({
      message: "Appointment details retrieved successfully",
      appointment,
    });
  } catch (error) {
    console.error("Get appointment details error:", error);
    res.status(500).json({
      message: "Error fetching appointment details",
      error: error.message,
    });
  }
});

// Mark appointment as completed (Doctor only)
router.post("/:appointmentId/complete", authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const doctorId = req.user.doctorId;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      doctorId,
      status: "scheduled",
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Appointment not found or cannot be completed" });
    }

    if (new Date(appointment.date) > new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot complete future appointments" });
    }

    appointment.status = "completed";
    await appointment.save();

    res.json({
      message: "Appointment marked as completed",
      appointment,
    });
  } catch (error) {
    console.error("Complete appointment error:", error);
    res.status(500).json({
      message: "Error completing appointment",
      error: error.message,
    });
  }
});

// Cancel appointment (Both doctor and patient)
router.post("/:appointmentId/cancel", authMiddleware, async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.userId;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      $or: [{ patientId: userId }, { doctorId: userId }],
      status: "scheduled",
    });

    if (!appointment) {
      return res
        .status(404)
        .json({ message: "Appointment not found or cannot be cancelled" });
    }

    // Check if cancellation is allowed (24 hours before appointment)
    if (
      new Date(appointment.date) <= new Date(Date.now() + 24 * 60 * 60 * 1000)
    ) {
      return res
        .status(400)
        .json({ message: "Cannot cancel appointment within 24 hours" });
    }

    // Start transaction for refund process
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update appointment status
      appointment.status = "cancelled";
      await appointment.save({ session });

      // Refund to user's wallet
      const user = await User.findById(appointment.patientId);
      user.wallet.balance += appointment.payment.finalAmount;
      await user.save({ session });

      // Create refund transaction
      const refundTransaction = new Transaction({
        userId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentId: appointment._id,
        type: "appointment_refund",
        amount: appointment.payment.finalAmount,
        currency: appointment.payment.currency,
        status: "completed",
        metadata: {
          originalAppointmentDate: appointment.date,
          cancellationInitiator: userId,
        },
      });
      await refundTransaction.save({ session });

      await session.commitTransaction();

      res.json({
        message: "Appointment cancelled and payment refunded",
        appointment,
        refundTransaction,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error("Cancel appointment error:", error);
    res.status(500).json({
      message: "Error cancelling appointment",
      error: error.message,
    });
  }
});

// Route to get appointments for a specific doctor
router.get("/doctor-appointments", authMiddleware, async (req, res) => {
  try {
    console.log("Decoded doctorId from JWT:", req.user.doctorId); // Debugging

    // Ensure doctorId is a valid ObjectId
    const doctorId = req.user.doctorId;

    // Validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctorId",
      });
    }

    // Fetch all appointments for the doctor
    const appointments = await Appointment.find({ doctorId: doctorId });

    res.json({
      success: true,
      appointments: appointments,
    });
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
});
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Route to format and save a prescription
router.post("/format/:appointmentId", authMiddleware, async (req, res) => {
  try {
    const { prescription } = req.body;
    const appointmentId = req.params.appointmentId;

    console.log("Received Prescription Data:", prescription);

    // Find the appointment and verify it exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Construct the prompt for OpenAI
    const prompt = `
          Please convert the following prescription into JSON format. Return ONLY valid JSON, no additional text.
          The JSON should follow this exact structure:
          {
            "medications": [
              {
                "name": "medication name",
                "dosage": "dosage info",
                "frequency": "how often to take",
                "duration": "how long to take"
              }
            ],
            "physicalActivities": ["activity1", "activity2"],
            "diet": ["diet recommendation1", "diet recommendation2"],
            "days": 30
          }
  
          Prescription to format: ${prescription}`;

    // Get formatted response from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a medical prescription formatter. You must respond with ONLY valid JSON format, no explanation or additional text.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" }, // Ensure strict JSON format
    });

    // Debug: Log raw OpenAI response
    console.log("Raw OpenAI Response:", completion.choices[0].message.content);

    // Parse the OpenAI response
    let formattedPrescription;
    try {
      formattedPrescription = JSON.parse(completion.choices[0].message.content);
    } catch (parseError) {
      console.error("OpenAI response error:", parseError);
      return res
        .status(500)
        .json({ message: "Failed to parse OpenAI response into JSON" });
    }

    // Debug: Log parsed formatted prescription
    console.log("Parsed Formatted Prescription:", formattedPrescription);

    // Validate received formatted prescription before storing
    const sanitizedMedications =
      formattedPrescription.medications?.map((med) => ({
        name: med.name || "",
        dosage: med.dosage || "",
        frequency: med.frequency || "",
        duration: med.duration || "",
      })) || [];

    const sanitizedPhysicalActivities =
      formattedPrescription.physicalActivities?.map((activity) =>
        activity.trim()
      ) || [];

    const sanitizedFormattedGoals = sanitizedPhysicalActivities.map(
      (activity) => ({
        activity,
        frequency: "daily",
        duration: "30 minutes",
        status: "completed", // Remove unwanted quotes
      })
    );

    // Ensure status values are valid
    //   sanitizedFormattedGoals.forEach(goal => {
    //       if (!['pending', 'accepted', 'completed'].includes(goal.status)) {
    //           goal.status = 'pending'; // Default to pending if invalid
    //       }
    //   });

    // Create a new prescription document
    const newPrescription = new Prescription({
      appointmentId: appointmentId,
      doctorId: appointment.doctorId,
      patientId: appointment.patientId,
      diagnosis: formattedPrescription.diagnosis || "",
      medications: sanitizedMedications,
      physicalActivities: sanitizedPhysicalActivities,
      formattedGoals: sanitizedFormattedGoals,
      notes: formattedPrescription.diet?.join(", ") || "",
      isFormatted: true,
    });

    // Save the prescription to the database
    const savedPrescription = await newPrescription.save();

    // Update the appointment with prescription ID
    appointment.prescriptionId = savedPrescription._id;
    await appointment.save();

    res.status(201).json({
      message: "Prescription formatted and saved successfully",
      prescription: savedPrescription,
    });
  } catch (error) {
    console.error("Error in prescription formatting:", error);
    res.status(500).json({
      message: "Error processing prescription",
      error: error.message,
    });
  }
});

module.exports = router;
