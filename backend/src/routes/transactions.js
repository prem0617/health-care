// routes/transactions.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('./middleware/authMiddleware');
const Transaction = require('../models/Transaction'); // Make sure this path is correct
const mongoose = require('mongoose');

router.get('/', authMiddleware, async (req, res) => {

    try {
        const transactions = await Transaction.find({ userId: req.user.userId })
            .populate({
                path: 'appointmentId',
                populate: {
                    path: 'doctorId',
                    select: 'name specialization'
                }
            })
            .sort('-createdAt');

        res.json({
            message: 'Transactions retrieved successfully',
            transactions
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching transactions',
            error: error.message
        });
    }
});

router.get('/', authMiddleware, async (req, res) => {

    try {
        const transactions = await Transaction.find({ userId: req.user.userId })
            .populate({
                path: 'appointmentId',
                populate: {
                    path: 'doctorId',
                    select: 'name specialization'
                }
            })
            .sort('-createdAt');
            
        res.json({
            message: 'Transactions retrieved successfully',
            transactions
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching transactions',
            error: error.message
        });
    }
});
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const { doctorId } = req.params;
        
        // Validate doctorId
        if (!mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                message: 'Invalid doctor ID format'
            });
        }

        const transactions = await Transaction.find({ doctorId })
            .populate({
                path: 'userId',
                select: 'profile.firstName profile.lastName profile.phone email'
            })
            .populate({
                path: 'appointmentId',
                select: 'date slot status isFirstConsultation'
            })
            .sort('-createdAt');

        res.json({
            message: 'Transactions retrieved successfully',
            data: {
                transactions,
                pagination: {
                    total: transactions.length
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error fetching transactions',
            error: error.message
        });
    }
});

module.exports = router;