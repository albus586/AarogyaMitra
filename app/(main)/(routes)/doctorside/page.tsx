"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { contentComponents, type ContentKey } from "@/components/content";
import {
  LayoutDashboard,
  Calendar,
  PillBottleIcon,
  UserRoundPen,
  UserCheck,
  MapIcon,
  Stethoscope,
} from "lucide-react";

export default function Home() {
  const [activeContent, setActiveContent] = useState<ContentKey | null>(null);
  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as ContentKey;
    setActiveContent(hash || "home");
  }, []);
  useEffect(() => {
    if (activeContent) {
      window.location.hash = activeContent;
    }
  }, [activeContent]);

  if (!activeContent) {
    return null; // or a loading spinner
  }
  const ContentComponent = contentComponents[activeContent];

  const menuItems2: {
    icon: React.ElementType;
    label: string;
    key: ContentKey;
  }[] = [
    { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
    { icon: Calendar, label: "DrAppointments", key: "drappointments" },
    // { icon: PillBottleIcon, label: "Prescription", key: "prescription" },
    { icon: UserRoundPen, label: "Patient Statistics", key: "patientStat" },
    { icon: UserCheck, label: "Patient List", key: "PatientList" },
    { icon: MapIcon, label: "Map", key: "mapContent" },
    { icon: Stethoscope, label: "Consult Patient", key: "consultDoc" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex pt-16">
        <Sidebar
          activeContent={activeContent}
          setActiveContent={setActiveContent}
          menuItems={menuItems2}
        />
        <main className="flex-1 p-8 ml-64">
          <ContentComponent
            patientEmail=""
            patient={{
              _id: "",
              patientName: "",
              patientEmail: "",
              appointmentDate: "",
              timeSlot: "",
              appointmentStatus: "",
              prescriptionStatus: "",
              reason: "",
            }}
          />
        </main>
      </div>
    </div>
  );
}
