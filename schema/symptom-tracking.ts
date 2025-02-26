import mongoose from 'mongoose';

const symptomTrackingSchema = new mongoose.Schema({
  patientEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  diseaseName: {
    type: String,
    required: true
  },
  symptom: {
    type: String,
    required: true
  },
  estimatedDays: {
    type: Number,
    required: true
  },
  isCured: {
    type: Boolean,
    default: false
  },
  dailyLogs: [{
    date: {
      type: Date,
      required: true
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

symptomTrackingSchema.index({ patientEmail: 1, createdAt: -1 });

export const SymptomTracking = mongoose.models.SymptomTracking || 
  mongoose.model('SymptomTracking', symptomTrackingSchema);
