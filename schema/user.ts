import mongoose, { Document, Model, Schema } from "mongoose";

interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  id: string;
  userType: 'Doctor' | 'Patient';
  age?: number;
  phoneNo?: string;
  bp?: string;
  weight?: number;
  heartRate?: number;
  medicalHistory?: string;
  previousVisit?: string;
  allergies?: string;
  currentMedication?: string;
  reasonForVisit?: string;
}

const UserSchema: Schema<IUser> = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  userType: {
    type: String,
    required: true,
    enum: ['Doctor', 'Patient'],
  },
  age: {
    type: Number,
  },
  phoneNo: {
    type: String,
  },
  bp: {
    type: String,
  },
  weight: {
    type: Number,
  },
  heartRate: {
    type: Number,
  },
  medicalHistory: {
    type: String,
  },
  previousVisit: {
    type: String,
    default: 'none',
  },
  allergies: {
    type: String,
  },
  currentMedication: {
    type: String,
    default: 'none',
  },
  reasonForVisit: {
    type: String,
  },
}, { timestamps: true });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;