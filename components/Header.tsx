"use client";

import Link from "next/link";
import { User, Settings, LogOut, Medal, Ambulance } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Img from "next/image";

interface HeaderProps {
  score?: number;
}

// Add the Toast component
const Toast = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-[12%] right-4 p-4 rounded shadow-lg text-white z-50 ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {message}
    </div>
  );
};

export function Header({ score }: HeaderProps) {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/user");
        const data = await response.json();
        if (data.name) {
          setUserName(data.name);
        }
        if (data.userRole) {
          setUserRole(data.userRole);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setUserName("");
        window.location.href = "/sign-in";
      } else {
        const data = await response.json();
        console.error("Logout failed:", data.error);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sendMessage = async () => {
    try {
      // Get user's current location
      const getLocation = () => {
        return new Promise<{ latitude: number; longitude: number }>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              (error) => reject(error)
            );
          }
        );
      };

      const location = await getLocation();
      const response = await fetch("/api/auth/user");
      const userData = await response.json();

      // Prepare the original data object
      const originalData = {
        name: userData.name,
        age: userData.age,
        phone: userData.phone,
        latitude: location.latitude,
        longitude: location.longitude,
      };

      // Format the message for WhatsApp
      const messageBody = `
        🚨 Emergency Alert 🚨
  
        Patient Details:
        - Name: ${userData.name}
        - Age: ${userData.age}
        - Phone: ${userData.phone}
  
        Current Location:
        - Latitude: ${location.latitude}
        - Longitude: ${location.longitude}
  
        Please take immediate action!
      `.trim();

      const sendMessageResponse = await fetch("/api/send-whatsapp-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageBody,
          originalData: originalData, // Send both formatted message and original data
        }),
      });

      if (!sendMessageResponse.ok) {
        throw new Error(`HTTP error! status: ${sendMessageResponse.status}`);
      }

      const data = await sendMessageResponse.json();
      console.log("Message SID:", data.sid);
      console.log("Emergency ID:", data.emergencyId);
      setToast({ message: "Requested for Help!", type: "success" });
    } catch (error) {
      console.error("Error sending message:", error);
      setToast({ message: "Failed to send message", type: "error" });
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <header className="fixed top-0 left-0 right-0 z-10">
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/[0.02] via-purple-500/[0.02] to-blue-500/[0.02]" />

        <div className="relative">
          <div className="flex items-center justify-between px-8 py-4 max-w-[2000px] mx-auto">
            <div className="flex items-center space-x-14">
              <div className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute -inset-1  rounded-full blur opacity-20 group-hover:opacity-30 transition-all duration-300" />
                  <Img
                    src="/logog.png"
                    alt="Chronix Logo"
                    className="relative h-auto w-auto bg-transparent transform group-hover:scale-105 transition-transform duration-300"
                    width={40}
                    height={40}
                  />
                </div>
                <Link
                  href="/"
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                >
                  AarogyaMitra
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {score !== undefined && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 px-6 py-2.5 rounded-full border border-yellow-100 dark:border-yellow-800 shadow-sm hover:shadow-md transition-all duration-300">
                  <Medal className="w-5 h-5 text-yellow-500 animate-pulse" />
                  <span className="font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                    {score} points
                  </span>
                </div>
              )}

              {userRole === "Patient" && (
                <button
                  onClick={sendMessage}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold rounded-lg shadow-lg hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-200 transform hover:scale-105 flex items-center space-x-2"
                >
                  <Ambulance className="w-5 h-5" />
                  <span>Emergency</span>
                </button>
              )}

              {userName && (
                <span className="font-medium text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full bg-gray-50 dark:bg-gray-800/50">
                  {userName}
                </span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-0 group-hover:opacity-20 transition-all duration-300" />
                    <div className="relative rounded-full bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-2 hover:shadow-md transition-all duration-300">
                      <span className="sr-only">Open user menu</span>
                      <User className="h-8 w-8 text-gray-600 dark:text-gray-300 group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 mt-2 p-1.5 border-none shadow-xl dark:shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl"
                >
                  <DropdownMenuItem
                    onClick={() => router.push("/profile")}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-all duration-200 group"
                  >
                    <User className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem className="flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-all duration-200 group">
                    <Settings className="h-4 w-4 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium">Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 mt-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer transition-all duration-200 group"
                  >
                    <LogOut className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                    <span className="font-medium text-red-600 dark:text-red-400">
                      Logout
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
