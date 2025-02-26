import mongoose from 'mongoose';

const diseaseSchema = new mongoose.Schema({
  predictedDisease: { 
    type: String, 
    required: true 
  },
  symptoms: { 
    type: [String], 
    required: true 
  },
  followUpSteps: { 
    type: [String], 
    default: [] 
  },
  recoveryDays: { 
    type: Number, 
    default: 0 
  }
});

const aiRiskAssessmentSchema = new mongoose.Schema({
  patientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  diseases: [diseaseSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

aiRiskAssessmentSchema.index({ patientEmail: 1, createdAt: -1 });

export const AiRiskAssessment = mongoose.models.AiRiskAssessment || 
  mongoose.model('AiRiskAssessment', aiRiskAssessmentSchema);