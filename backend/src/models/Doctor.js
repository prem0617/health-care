const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  consultationFee: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' }
  },
  chatFee: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' }
  },
}, { timestamps: true });

 // Hash password before saving
doctorSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
}); 
module.exports = mongoose.model('Doctor', doctorSchema);
