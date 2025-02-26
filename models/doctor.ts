import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  doctor_name: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  time_slots: {
    type: [String],
    required: true
  },
  available_days: {
    type: [String],
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 4.5
  }
});

export const Doctor = mongoose.models.Doctor || mongoose.model('Doctor', doctorSchema);