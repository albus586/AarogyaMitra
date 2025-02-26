"use client";

import React, { useState, useEffect } from "react";
import twilio from "twilio";
import {
  Calendar,
  MapPin,
  Clock,
  Award,
  Search,
  X,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Doctor {
  _id: string;
  doctor_name: string;
  specialization: string;
  city: string;
  experience: number;
  time_slots: string[];
  available_days: string[];
  gender: string;
  language: string;
  rating: number;
  status: string;
  distance_km: number;
}

interface Appointment {
  _id: string;
  doctorName: string;
  specialization: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  appointmentStatus: string;
}

// Add a utility function to get the image path based on specialization
const getDoctorImage = (specialization: string): string => {
  const specializationMap: { [key: string]: string } = {
    Cardiologist: "/doctor/cardiologist.png",
    Dermatologist: "/doctor/dermatologist.png",
    Orthopedic: "/doctor/orthopedic.png",
    Pediatrician: "/doctor/pediatrician.png",
    "General Physician": "/doctor/physician.png",
  };

  return specializationMap[specialization] || "/doctor/physician.png"; // default to physician if specialization not found
};

// Add this utility function near the top of the file
const formatDistance = (distance: number): string => {
  return distance.toFixed(1);
};

export const AppointmentsContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [filters, setFilters] = useState({
    city: "",
    specialty: "",
    language: "",
    gender: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [viewAppointments, setViewAppointments] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const handleToggleView = () => {
    setViewAppointments((prev) => !prev);
  };

  const fetchAppointments = async () => {
    try {
      setIsLoading(true); // Add loading state
      const response = await fetch("/api/appointments");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch appointments");
      }
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to fetch appointments"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (viewAppointments) {
      fetchAppointments();
    }
  }, [viewAppointments]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.city) queryParams.append("city", filters.city);
        if (filters.specialty)
          queryParams.append("specialty", filters.specialty);
        if (filters.language) queryParams.append("language", filters.language);
        if (filters.gender) queryParams.append("gender", filters.gender);

        const response = await fetch(`/api/doctors?${queryParams}`);
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        setDoctors(data);
        setFilteredDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, [filters]);

  useEffect(() => {
    const filtered = doctors.filter((doctor) => {
      const matchesSearch =
        doctor.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
    setFilteredDoctors(filtered);
  }, [searchTerm, doctors]);

  const clearFilters = () => {
    setFilters({
      city: "",
      specialty: "",
      language: "",
      gender: "",
    });
    setSearchTerm("");
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const confirmAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTimeSlot) {
      setErrorMessage("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: selectedDoctor._id,
          doctorName: selectedDoctor.doctor_name,
          specialization: selectedDoctor.specialization,
          appointmentDate: selectedDate,
          timeSlot: selectedTimeSlot,
          appointmentStatus: "pending",
          prescriptionStatus: "pending",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to book appointment");
      }

      setIsBookingComplete(true);
      // Close the modal after a brief delay to show the success message
      setTimeout(() => {
        closeModal();
      }, 1500);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to book appointment"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setCurrentStep(1);
    setIsModalOpen(true);
    setIsBookingComplete(false);
    setSelectedDate(undefined);
    setSelectedTimeSlot("");
    setErrorMessage("");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedTimeSlot("");
    setIsBookingComplete(false);
  };

  return (
    <div className="space-y-8 px-6 py-10 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          {viewAppointments ? "My Appointments" : "Book Appointment"}
        </h1>
        <Button
          onClick={handleToggleView}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
        >
          {viewAppointments ? "Book Appointments" : "View Appointments"}
        </Button>
      </div>

      {viewAppointments && (
        <>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : errorMessage ? (
            <div className="text-red-500 text-center p-4">{errorMessage}</div>
          ) : appointments.length === 0 ? (
            <div className="text-center p-8">
              <div className="mb-4">
                <Calendar className="w-12 h-12 mx-auto text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
                No appointments found
              </h3>
              <p className="text-gray-500 mt-2">
                Book your first appointment to get started
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                        <img
                          src={getDoctorImage(appointment.specialization)}
                          alt={appointment.specialization}
                          className="w-10 h-10 object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-gray-800 dark:text-white">
                          {appointment.doctorName}
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium">
                          {appointment.specialization}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl">
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                        <span>
                          {new Date(
                            appointment.appointmentDate
                          ).toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-300">
                        <Clock className="h-5 w-5 mr-3 text-blue-500" />
                        <span>{appointment.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium
                          ${
                            appointment.status === "completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          }`}
                        >
                          {appointment.status || "scheduled"}
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium
                          ${
                            appointment.appointmentStatus === "completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {appointment.appointmentStatus || "pending"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!viewAppointments && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor._id}
              className="group bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 overflow-hidden">
                    <img
                      src={getDoctorImage(doctor.specialization)}
                      alt={doctor.specialization}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800 dark:text-white">
                      {doctor.doctor_name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      {doctor.specialization}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="h-5 w-5 mr-3 text-blue-500" />
                    <span>{doctor.city}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Award className="h-5 w-5 mr-3 text-blue-500" />
                    <span>{doctor.experience} years experience</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar className="h-5 w-5 mr-3 text-blue-500" />
                    <span>Available: {doctor.available_days.join(", ")}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistance(doctor.distance_km)} km away
                    </span>
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${
                        doctor.status === "Away"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {doctor.status}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/50 transition-all duration-300 rounded-xl py-3"
                  onClick={() => openModal(doctor)}
                >
                  Book Appointment
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Section */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-blue-100 dark:border-blue-900 rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            {isBookingComplete ? (
              <div className="flex flex-col items-center gap-4 mt-2">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  Your appointment has been booked successfully!
                </span>
              </div>
            ) : (
              <DialogDescription>Step {currentStep} of 3</DialogDescription>
            )}
          </DialogHeader>

          <div className="mt-4">
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Confirm Doctor Details
                </h3>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    {selectedDoctor && (
                      <>
                        <p>
                          <strong>Doctor:</strong> {selectedDoctor.doctor_name}
                        </p>
                        <p>
                          <strong>Specialization:</strong>{" "}
                          {selectedDoctor.specialization}
                        </p>
                        <p>
                          <strong>Experience:</strong>{" "}
                          {selectedDoctor.experience} years
                        </p>
                        <p>
                          <strong>City:</strong> {selectedDoctor.city}
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Date</h3>
                <Card>
                  <CardContent className="p-4">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border"
                      disabled={(date) => {
                        // Disable past dates
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        // Disable dates that aren't in available_days
                        const dayName = date.toLocaleDateString("en-US", {
                          weekday: "long",
                        });
                        return (
                          date < today ||
                          !selectedDoctor?.available_days.includes(dayName)
                        );
                      }}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Time Slot</h3>
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-3 gap-3">
                      {selectedDoctor?.time_slots.map((slot) => (
                        <Button
                          key={slot}
                          variant={
                            selectedTimeSlot === slot ? "default" : "outline"
                          }
                          className={cn(
                            "w-full",
                            selectedTimeSlot === slot &&
                              "bg-blue-600 text-white"
                          )}
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          {slot}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
                {errorMessage}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Previous
              </Button>
            )}
            {currentStep < 3 && (
              <Button
                onClick={nextStep}
                disabled={currentStep === 2 && !selectedDate}
              >
                Next
              </Button>
            )}
            {currentStep === 3 && (
              <Button
                onClick={confirmAppointment}
                disabled={!selectedTimeSlot || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⌛</span>
                    Booking...
                  </>
                ) : (
                  "Confirm Appointment"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentsContent;
