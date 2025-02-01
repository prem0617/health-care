// routes/appointments.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('./middleware/authMiddleware');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const mongoose = require('mongoose');

function calculatePayment(doctor, isFirstConsultation) {
    const payment = {
        originalAmount: doctor.consultationFee.amount,
        currency: doctor.consultationFee.currency,
        discountApplied: 0,
        finalAmount: doctor.consultationFee.amount
    };

    if (isFirstConsultation && doctor.firstTimeDiscount) {
        payment.discountApplied = Math.min(
            (doctor.consultationFee.amount * doctor.firstTimeDiscount.percentage) / 100,
            doctor.firstTimeDiscount.maxAmount
        );
        payment.finalAmount = payment.originalAmount - payment.discountApplied;
    }

    return payment;
}

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { doctorId, date, slot } = req.body;
        const patientId = req.user.userId;

        // Basic validations
        const [doctor, user] = await Promise.all([
            Doctor.findById(doctorId),
            User.findById(patientId)
        ]);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Check for slot availability
        const appointmentDate = new Date(date);
        const conflictingAppointment = await Appointment.findOne({
            doctorId,
            date: appointmentDate,
            'slot.startTime': slot.startTime,
            'slot.endTime': slot.endTime,
            status: { $ne: 'cancelled' }
        });

        if (conflictingAppointment) {
            return res.status(400).json({
                message: 'Slot not available',
                conflictingTimeSlot: {
                    date: appointmentDate,
                    startTime: slot.startTime,
                    endTime: slot.endTime
                }
            });
        }

        // Check if first consultation
        const isFirstConsultation = !user.appointedDoctors.includes(doctorId);
        const payment = calculatePayment(doctor, isFirstConsultation);

        // Check wallet balance
        if (user.wallet.balance < payment.finalAmount) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Create and save appointment
        const appointment = new Appointment({
            doctorId,
            patientId,
            date: appointmentDate,
            slot,
            payment,
            isFirstConsultation
        });
        await appointment.save();

        // Create and save transaction
        const transaction = new Transaction({
            userId: patientId,
            doctorId:doctorId,
            appointmentId: appointment._id,
            type: 'appointment_payment',
            amount: payment.finalAmount,
            currency: payment.currency,
            status: 'completed',
            metadata: {
                discountApplied: payment.discountApplied,
                originalAmount: payment.originalAmount
            }
        });
        await transaction.save();

        // Update user wallet and appointedDoctors
        user.wallet.balance -= payment.finalAmount;
        if (isFirstConsultation) {
            user.appointedDoctors.push(doctorId);
        }
        await user.save();

        res.status(201).json({
            message: 'Appointment booked successfully',
            appointment,
            transaction
        });

    } catch (error) {
        console.error('Appointment booking error:', error);
        res.status(500).json({
            message: 'Error creating appointment',
            error: error.message
        });
    }
});

// Get appointments
// Patient route
router.get('/my-appointments', authMiddleware, async (req, res) => {
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
            .sort({ date: -1, 'slot.startTime': -1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'doctorId',
                select: 'name specialization consultationFee firstTimeDiscount'
            })
            .lean();

        // Get total count for pagination
        const totalAppointments = await Appointment.countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(totalAppointments / limit);

        // Add additional booking-related information
        const enhancedAppointments = appointments.map(appointment => ({
            ...appointment,
            isPast: new Date(appointment.date) < new Date(),
            canCancel: appointment.status === 'scheduled' && 
                      new Date(appointment.date) > new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            canReschedule: appointment.status === 'scheduled' &&
                         new Date(appointment.date) > new Date(Date.now() + 24 * 60 * 60 * 1000)
        }));

        res.json({
            message: 'Appointments retrieved successfully',
            data: {
                appointments: enhancedAppointments,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalAppointments,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Fetch appointments error:', error);
        res.status(500).json({
            message: 'Error fetching appointments',
            error: error.message
        });
    }
});
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let query = { doctorId };
        
        if (req.query.status) query.status = req.query.status;
        if (req.query.fromDate || req.query.toDate) {
            query.date = {};
            if (req.query.fromDate) query.date.$gte = new Date(req.query.fromDate);
            if (req.query.toDate) query.date.$lte = new Date(req.query.toDate);
        }

        const [appointments, totalAppointments] = await Promise.all([
            Appointment.find(query)
                .sort({ date: -1, 'slot.startTime': -1 })
                .skip(skip)
                .limit(limit)
                .populate('patientId', 'email profile')
                .lean(),
            Appointment.countDocuments(query)
        ]);

        const totalPages = Math.ceil(totalAppointments / limit);
        const enhancedAppointments = appointments.map(appointment => ({
            ...appointment,
            isPast: new Date(appointment.date) < new Date(),
            canMarkComplete: appointment.status === 'scheduled' && new Date(appointment.date) < new Date(),
            canCancel: appointment.status === 'scheduled' && 
                      new Date(appointment.date) > new Date(Date.now() + 24 * 60 * 60 * 1000)
        }));

        res.json({
            message: 'Appointments retrieved successfully',
            data: {
                appointments: enhancedAppointments,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalAppointments,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Fetch doctor appointments error:', error);
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
});
module.exports = router;