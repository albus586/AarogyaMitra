"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  BarChart,
  Brain,
  Clock,
  Heart,
  Music,
  Pause,
  Volume2,
} from "lucide-react";
import { RadialChart } from "@/components/mental-health/radial-chart";

interface MentalFitnessDashboardProps {
  lastSubmission: Date | null;
  mentalScore: number | null;
  voiceAnalysis: {
    Clarity: string;
    Control: string;
    Crispness: string;
    Energy_range: string;
    Liveliness: string;
    Pause: string;
    Smoothness: string;
    Speech: string;
  } | null;
}

export function MentalFitnessDashboard({
  lastSubmission,
  mentalScore,
  voiceAnalysis,
}: MentalFitnessDashboardProps) {
  const metrics = [
    {
      title: "Smoothness",
      value: voiceAnalysis?.Smoothness || "N/A",
      icon: Activity,
      color: "bg-blue-100 text-blue-800",
    },
    {
      title: "Control",
      value: voiceAnalysis?.Control || "N/A",
      icon: Brain,
      color: "bg-green-100 text-green-800",
    },
    {
      title: "Liveliness",
      value: voiceAnalysis?.Liveliness || "N/A",
      icon: Heart,
      color: "bg-red-100 text-red-800",
    },
    {
      title: "Energy Range",
      value: voiceAnalysis?.Energy_range || "N/A",
      icon: BarChart,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      title: "Clarity",
      value: voiceAnalysis?.Clarity || "N/A",
      icon: Music,
      color: "bg-purple-100 text-purple-800",
    },
    {
      title: "Crispness",
      value: voiceAnalysis?.Crispness || "N/A",
      icon: Volume2,
      color: "bg-indigo-100 text-indigo-800",
    },
    {
      title: "Speech",
      value: voiceAnalysis?.Speech || "N/A",
      icon: Clock,
      color: "bg-teal-100 text-teal-800",
    },
    {
      title: "Pause",
      value: voiceAnalysis?.Pause || "N/A",
      icon: Pause,
      color: "bg-pink-100 text-pink-800",
    },
  ];

  return (
    <div className="container mx-auto p-4">
      {/* First Row with 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {metrics.slice(0, 4).map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card
              key={index}
              className={`flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 ${metric.color}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className="h-8 w-8" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {lastSubmission?.toLocaleString() || "Never"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Second Row with 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* First Column with Radial Chart */}
        <div className="flex justify-center items-center">
          <RadialChart
            score={mentalScore || 0}
            remark={getRemark(mentalScore || 0)}
            lastReading={
              lastSubmission ? lastSubmission.toLocaleString() : "N/A"
            }
          />
        </div>

        {/* Second Column with 4 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.slice(4).map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card
                key={index}
                className={`flex flex-col justify-between transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105 ${metric.color}`}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <Icon className="h-8 w-8" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last updated: {lastSubmission?.toLocaleString() || "Never"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getRemark(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Improvement";
}
