const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {  // Added doctorId reference
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  type: {
    type: String,
    enum: ['appointment_payment', 'wallet_credit', 'wallet_debit'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  metadata: {
    discountApplied: Number,
    originalAmount: Number,
    paymentMethod: String,
    refundReason: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);