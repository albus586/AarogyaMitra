import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    patientEmail: { type: String, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    specialization: { type: String, required: true },
    appointmentDate: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: { type: String, default: 'scheduled' },
    appointmentStatus: { type: String, default: 'pending' },
    prescriptionStatus: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

export default Appointment;
