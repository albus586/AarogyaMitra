import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Pill,
  Heart,
  Weight,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Appointment {
  _id: string;
  patientName: string;
  age: number;
  phone: string;
  email: string;
  date: string;
  time: string;
  appointmentStatus: "pending" | "confirmed" | "cancelled";
  reason: string;
  bloodPressure?: string;
  weight?: string;
  heartRate?: string;
  previousVisit?: string;
  allergies?: string;
  medications?: string;
}

export const DrAppointmentsContent = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axios.get("/api/appointments");
        const pendingAppointments = response.data.filter(
          (appointment: Appointment) =>
            appointment.appointmentStatus === "pending"
        );
        setAppointments(pendingAppointments);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  const handleConfirm = async (
    id: string,
    phone: string,
    date: string,
    time: string
  ): Promise<void> => {
    try {
      console.log("Appointment ID being sent:", id); // Add this line
      await axios.patch(`/api/appointments/${id}`, {
        appointmentStatus: "confirmed",
      });

      // Send confirmation message via WhatsApp
      await axios.post("/api/send-appointment", {
        to: phone,
        message: `Your appointment has been confirmed for ${date} at ${time}`,
      });

      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment._id !== id)
      );
    } catch (error) {
      // Enhance error logging
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
      }
      console.error("Error confirming appointment:", error);
    }
  };

  const handleCancel = async (id: string): Promise<void> => {
    try {
      await axios.patch(`/api/appointments/${id}`, {
        appointmentStatus: "cancelled",
      });

      setAppointments((prevAppointments) =>
        prevAppointments.filter((appointment) => appointment._id !== id)
      );
    } catch (error) {
      console.error("Error cancelling appointment:", error);
    }
  };

  const openAppointmentModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handlePrescribe = () => {
    // Add prescription logic here
    console.log("Prescribing medicine for:", selectedAppointment?.patientName);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Today's Appointments</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.map((appointment, index) => (
          <Card
            key={appointment._id ? appointment._id.toString() : index}
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={() => openAppointmentModal(appointment)}
          >
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <User className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl text-gray-800">
                    {appointment.patientName}
                  </h3>
                  <p className="text-blue-600 font-medium">
                    Age: {appointment.age}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-600">
                  <Phone className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{appointment.phone}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{appointment.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{appointment.date}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  <span>{appointment.time}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="font-medium text-gray-700">Reason for Visit:</p>
                <p className="text-gray-600">{appointment.reason}</p>
              </div>

              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                {appointment.appointmentStatus === "pending" ? (
                  <>
                    <Button
                      className="flex-1"
                      onClick={() =>
                        handleConfirm(
                          appointment._id,
                          appointment.phone,
                          appointment.date,
                          appointment.time
                        )
                      }
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Confirm
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleCancel(appointment._id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : appointment.appointmentStatus === "confirmed" ? (
                  <Button variant="secondary" className="w-full" disabled>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Confirmed
                  </Button>
                ) : (
                  <Button variant="destructive" className="w-full" disabled>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelled
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Personal Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedAppointment.patientName}
                    </p>
                    <p>
                      <span className="font-medium">Age:</span>{" "}
                      {selectedAppointment.age}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedAppointment.phone}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedAppointment.email}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {selectedAppointment.date}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span>{" "}
                      {selectedAppointment.time}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Medical Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                      <span>BP: {selectedAppointment.bloodPressure}</span>
                    </div>
                    <div className="flex items-center">
                      <Weight className="h-4 w-4 mr-2 text-blue-500" />
                      <span>Weight: {selectedAppointment.weight}</span>
                    </div>
                    <div className="flex items-center">
                      <Activity className="h-4 w-4 mr-2 text-green-500" />
                      <span>Heart Rate: {selectedAppointment.heartRate}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Medical History</h3>
                <p>
                  <span className="font-medium">Previous Visit:</span>{" "}
                  {selectedAppointment.previousVisit}
                </p>
                <p>
                  <span className="font-medium">Allergies:</span>{" "}
                  {selectedAppointment.allergies}
                </p>
                <p>
                  <span className="font-medium">Current Medications:</span>{" "}
                  {selectedAppointment.medications}
                </p>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={handlePrescribe}>
                  <Pill className="h-4 w-4 mr-2" />
                  Prescribe Medicine
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DrAppointmentsContent;
