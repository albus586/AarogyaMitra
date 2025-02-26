import { useState, useEffect } from "react";
import axios from "axios";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { Mic } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PrescriptionContent } from "./prescription-content";

interface Patient {
  _id: string;
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  timeSlot: string;
  reason: string;
}

interface Appointment extends Patient {
  appointmentStatus: string;
  prescriptionStatus: string;
}

export default function PatientListContent() {
  const [patients, setPatients] = useState<Appointment[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [activePatient, setActivePatient] = useState<Appointment | null>(null); // New state for active patient

  // Fetch confirmed appointments
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axios.get("/api/appointments");
        // Filter only confirmed appointments
        const confirmedAppointments = response.data.filter(
          (appointment: Appointment) =>
            appointment.appointmentStatus === "confirmed"
        );
        setPatients(confirmedAppointments);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };

    fetchPatients();
  }, []);

  // Sorting function
  const sortData = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Handle prescription
  const handlePrescribe = async (patient: Appointment) => {
    try {
      // Update prescription status in the database
      await axios.patch(`/api/appointments/${patient._id}`, {
        prescriptionStatus: "completed",
      });

      // Update local state
      setPatients((prevPatients) =>
        prevPatients.map((p) =>
          p._id === patient._id ? { ...p, prescriptionStatus: "completed" } : p
        )
      );
      setActivePatient(patient);
    } catch (error) {
      console.error("Error updating prescription status:", error);
    }
  };

  // Handle back button
  const handleBack = () => {
    setActivePatient(null);
  };

  // Sort patients based on current config
  const sortedPatients = [...patients].sort((a: any, b: any) => {
    if (!sortConfig) return 0;

    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  // Separate patients by prescription status
  const donePatients = sortedPatients.filter(
    (patient) => patient.prescriptionStatus === "completed"
  );
  const pendingPatients = sortedPatients.filter(
    (patient) => patient.prescriptionStatus !== "completed"
  );

  if (activePatient) {
    return (
      <div>
        <Button onClick={handleBack} variant="default" className="mb-4">
          Back to Patient List
        </Button>
        <PrescriptionContent patient={activePatient} />
      </div>
    ); // Render PrescriptionContent for active patient with back button
  }

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-300">
              Pending Prescriptions
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage prescriptions for pending appointments
            </p>
          </div>
          <Avatar className="h-12 w-12 ring-2 ring-gray-500 dark:ring-gray-400 shadow-md">
            <AvatarImage src="/api/placeholder/32/32" alt="Doctor" />
            <AvatarFallback className="bg-blue-200 text-blue-800">
              DR
            </AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-blue-200 dark:border-blue-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
                <TableRow>
                  <TableHead className="w-[80px]">
                    <Button
                      variant="ghost"
                      onClick={() => sortData("appointmentDate")}
                      className="flex items-center gap-1 text-blue-700 dark:text-blue-300"
                    >
                      Date
                      <CaretSortIcon className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => sortData("patientName")}
                      className="flex items-center gap-1 text-blue-700 dark:text-blue-300"
                    >
                      Patient
                      <CaretSortIcon className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Prescription</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPatients.map((patient) => (
                  <TableRow
                    key={patient._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {new Date(patient.appointmentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-300">
                          {patient.patientName}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          {patient.reason}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.timeSlot}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 bg-white dark:bg-gray-700"
                        onClick={() => handlePrescribe(patient)} // Pass patient to handlePrescribe
                        disabled={patient.prescriptionStatus === "completed"}
                      >
                        <Mic className="h-4 w-4" />
                        Prescribe
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${
                          patient.prescriptionStatus === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {patient.prescriptionStatus === "completed"
                          ? "Done"
                          : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-300">
              Completed Prescriptions
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Review completed prescriptions
            </p>
          </div>
          <Avatar className="h-12 w-12 ring-2 ring-gray-500 dark:ring-gray-400 shadow-md">
            <AvatarImage src="/api/placeholder/32/32" alt="Doctor" />
            <AvatarFallback className="bg-blue-200 text-blue-800">
              DR
            </AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-green-200 dark:border-green-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
                <TableRow>
                  <TableHead className="w-[80px]">
                    <Button
                      variant="ghost"
                      onClick={() => sortData("appointmentDate")}
                      className="flex items-center gap-1 text-blue-700 dark:text-blue-300"
                    >
                      Date
                      <CaretSortIcon className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => sortData("patientName")}
                      className="flex items-center gap-1 text-blue-700 dark:text-blue-300"
                    >
                      Patient
                      <CaretSortIcon className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Prescription</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donePatients.map((patient) => (
                  <TableRow
                    key={patient._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {new Date(patient.appointmentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-300">
                          {patient.patientName}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          {patient.reason}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{patient.timeSlot}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 bg-white dark:bg-gray-700"
                        onClick={() => handlePrescribe(patient)} // Pass patient to handlePrescribe
                        disabled={patient.prescriptionStatus === "completed"}
                      >
                        <Mic className="h-4 w-4" />
                        Prescribe
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${
                          patient.prescriptionStatus === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}
                      >
                        {patient.prescriptionStatus === "completed"
                          ? "Done"
                          : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
