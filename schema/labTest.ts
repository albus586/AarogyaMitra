import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  diseaseId: {
    type: String,
    required: true
  },
  answers: {
    type: Map,
    of: String,
    required: true
  },
  riskScore: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const LabTest = mongoose.models.LabTest || mongoose.model('LabTest', labTestSchema);
