import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  filename: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true, maxLength: 5242880 }, // Allows up to 5MB Base64 string
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Report || mongoose.model('Report', reportSchema);
