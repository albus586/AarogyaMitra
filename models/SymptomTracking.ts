import mongoose from 'mongoose';

const DailyLogSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  score: { type: Number, required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
});

const SymptomTrackingSchema = new mongoose.Schema({
  patientEmail: { type: String, required: true },
  diseaseName: { type: String, required: true },
  symptom: { type: String, required: true },
  estimatedDays: { type: Number, required: true },
  dailyLogs: [DailyLogSchema],
});

const SymptomTracking = mongoose.models.SymptomTracking || mongoose.model('SymptomTracking', SymptomTrackingSchema);

export default SymptomTracking;
