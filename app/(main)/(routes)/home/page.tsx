"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { contentComponents, type ContentKey } from "@/components/content";
import type { FC } from "react";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Brain,
  AlertTriangle,
  Salad,
  Cloud,
  GraduationCap,
  Users,
  HomeIcon,
  TestTube,
  PhoneCall,
  Stethoscope,
  HeartIcon,
  Activity,
} from "lucide-react";

export default function Home() {
  const [activeContent, setActiveContent] = useState<ContentKey | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
  const ContentComponent = contentComponents[activeContent] as FC<any>;
  // const ContentComponent = contentComponents[activeContent];
  const menuItems1: {
    icon: React.ElementType;
    label: string;
    key: ContentKey;
  }[] = [
    { icon: HomeIcon, label: "Home", key: "home" },
    { icon: HeartIcon, label: "My Health", key: "healthMonitoring" },
    { icon: Calendar, label: "My Appointments", key: "appointments" },
    { icon: Stethoscope, label: "Consult Doctor", key: "consultDoc" },
    { icon: AlertTriangle, label: "AI Risk Assessment", key: "risk" },
    { icon: TestTube, label: "Lab Tests", key: "lab" },
    { icon: Activity, label: "Symptom Tracking", key: "symptomTracking" },
    { icon: FileText, label: "Reports", key: "reports" },
    { icon: Calendar, label: "Calendar", key: "calander" },
    { icon: PhoneCall, label: "AI Companion", key: "aichat" },
    { icon: Brain, label: "Mental Health", key: "mentalhealth" },
    { icon: Salad, label: "Diet Plan", key: "diet" },
    // { icon: Cloud, label: "Progress Board", key: "kanban" },
    // { icon: GraduationCap, label: "Health Education", key: "education" },
    // { icon: Users, label: "Community Forum", key: "community" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header score={0} />
      <div className="pt-16 md:pt-14">
        <Sidebar
          activeContent={activeContent}
          setActiveContent={setActiveContent}
          menuItems={menuItems1}
        />
        <main
          className={`
            flex-1 p-4 md:p-8
            ml-0 md:ml-64 
            bg-white/50 dark:bg-gray-800/50 
            rounded-none md:rounded-tl-3xl 
            shadow-lg 
            min-h-[calc(100vh-4rem)]
            transition-all duration-300
            ${isMobileOpen ? "blur-sm md:blur-none" : ""}
          `}
        >
          <div className="max-w-7xl mx-auto">
            <ContentComponent
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
          </div>
        </main>
      </div>
    </div>
  );
}
