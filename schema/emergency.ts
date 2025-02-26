import mongoose from 'mongoose';

const EmergencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  phone: { type: String, required: true },
  location: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Emergency = mongoose.models.Emergency || mongoose.model('Emergency', EmergencySchema);

export default Emergency;
