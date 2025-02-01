const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  doctorId:{
    type : mongoose.Schema.Types.ObjectId,
    ref : 'Doctor',
    required : true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  slot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  payment: {
    originalAmount: { type: Number, required: true },
    discountApplied: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' }
  },
  isFirstConsultation: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

appointmentSchema.index({ doctorId: 1, date: 1, 'slot.startTime': 1, 'slot.endTime': 1 });
module.exports = mongoose.model('Appointment', appointmentSchema);