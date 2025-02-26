import mongoose, { Schema, Document } from 'mongoose';

interface IPrescription extends Document {
  prescription_duration: number;
  patient_name: string;
  doctor_name: string;
  medicine_names: string[];
  created_at: Date;
  userEmail: string;
  prescriptionId: string; // Added prescriptionId field
}

const PrescriptionSchema: Schema = new Schema({
  prescription_duration: { type: Number, required: true },
  patient_name: { type: String, required: true },
  doctor_name: { type: String, required: true },
  medicine_names: { type: [String], required: true },
  created_at: { type: Date, default: Date.now },
  userEmail: { type: String, required: true },
  prescriptionId: { type: String, required: true }, // Added prescriptionId field
});

const Prescription = mongoose.models.Prescription || mongoose.model<IPrescription>('Prescription', PrescriptionSchema);

export default Prescription;
