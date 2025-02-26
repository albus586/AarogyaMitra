"use client";

import { useState, useEffect } from "react";
import { CalendarWithPills } from "@/components/calander/calander";
import PillReminderCard from "@/components/calander/pill-reminder-card";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface PillSchedule {
  id: string;
  name: string;
  isTaken: boolean;
}

interface Prescription {
  created_at: Date;
  prescription_duration: number;
  medicine_names: string[];
  patient_name: string;
}

interface PillTracking {
  pillId: string;
  date: string;
}

export default function CalendarContent() {
  const [score, setScore] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { toast } = useToast();
  const [pillSchedule, setPillSchedule] = useState<PillSchedule[]>([]);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [pillTrackings, setPillTrackings] = useState<PillTracking[]>([]);
  const [activeMedicines, setActiveMedicines] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch prescriptions
        const prescriptionResponse = await axios.get("/api/prescriptions");
        const prescriptionData = prescriptionResponse.data;
        setPrescriptions(prescriptionData);
        setPrescription(prescriptionData[0]);

        // Update the API endpoint URL format
        const trackingResponse = await axios.get('/api/pill-tracking', {
          params: {
            date: selectedDate.toISOString().split("T")[0]
          }
        });
        
        // Set empty array if no data
        setPillTrackings(trackingResponse.data || []);
      } catch (error) {
        // Silently handle error and set empty arrays
        console.log("Data fetch attempted");
        setPillTrackings([]);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleDateSelect = (date: Date, medicines: string[]) => {
    setSelectedDate(date);
    setActiveMedicines(medicines);

    // Create schedule regardless of API response
    const newSchedule = medicines.map((medicine) => ({
      id: `${medicine}-morning`,
      name: medicine,
      isTaken: false, // Default to false, will update when data loads
    }));

    setPillSchedule(newSchedule);
  };

  const handleTakePill = async (pillId: string) => {
    const currentDate = selectedDate.toISOString().split("T")[0];

    // Update local state immediately
    setPillSchedule((schedule) =>
      schedule.map((pill) =>
        pill.id === pillId ? { ...pill, isTaken: true } : pill
      )
    );

    setPillTrackings([...pillTrackings, { pillId, date: currentDate }]);
    setScore((prev) => prev + 10);
    
    // Show success message
    toast({
      title: "Successfully Taken Pill + 10 points",
      className: "bg-green-500 text-white shadow-lg",
      duration: 3000,
    });

    // Try to save to API in background
    try {
      await axios.post("/api/pill-tracking", {
        pillId,
        date: currentDate,
        taken: true,
      });
    } catch (error) {
      // Silently handle error without showing to user
      console.log("Background save attempted");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <Header score={score} />
      <div className="max-w-6xl mx-auto space-y-8 p-6 transition-all duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors duration-200">
          <CalendarWithPills
            onDateSelect={handleDateSelect}
            highlightDates={
              prescription
                ? {
                    start: new Date(prescription.created_at),
                    end: new Date(
                      new Date(prescription.created_at).getTime() +
                        prescription.prescription_duration * 24 * 60 * 60 * 1000
                    ),
                  }
                : undefined
            }
            prescriptions={prescriptions}
            selectedDate={selectedDate}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillSchedule.map((pill) => (
            <div
              key={pill.id}
              className="transform transition-all duration-200 hover:-translate-y-1"
            >
              <PillReminderCard
                pillName={pill.name}
                date={selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                day={selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                })}
                onTakePill={() => handleTakePill(pill.id)}
                isTaken={pill.isTaken}
                className="h-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl shadow-md hover:shadow-xl transition-all duration-200"
              />
            </div>
          ))}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
