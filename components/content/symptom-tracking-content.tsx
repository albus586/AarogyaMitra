"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { generateReport } from "@/utils/reportGenerator";

interface DailyLog {
  date: Date;
  score: number;
  severity: "Low" | "Medium" | "High";
}

interface SymptomTrackingData {
  _id: string;
  patientEmail: string;
  diseaseName: string;
  symptom: string;
  estimatedDays: number;
  dailyLogs: DailyLog[];
}

interface Disease {
  predictedDisease: string;
  symptoms: string[];
  followUpSteps: string[];
  recoveryDays: number;
}

interface AiRiskAssessmentData {
  _id: string;
  patientEmail: string;
  diseases: Disease[];
}

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const SymptomTrackingContent = () => {
  const [rating, setRating] = useState<{ [key: string]: number }>({});
  const [trackingData, setTrackingData] = useState<SymptomTrackingData[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<AiRiskAssessmentData[]>(
    []
  );
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const [curedSymptoms, setCuredSymptoms] = useState<Set<string>>(new Set());
  const [curedSymptomsList, setCuredSymptomsList] = useState<{ [key: string]: string[] }>({});

  const handleCure = async (symptom: string) => {
    try {
      const response = await fetch("/api/symptom-tracking", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diseaseName: selectedDisease,
          symptom,
          isCured: true,
        }),
      });

      if (response.ok) {
        setCuredSymptoms((prev) => new Set([...prev, symptom]));
        // Update cured symptoms list
        setCuredSymptomsList((prev) => ({
          ...prev,
          [selectedDisease!]: [...(prev[selectedDisease!] || []), symptom],
        }));
        await fetchTrackingData();
      }
    } catch (error) {
      console.error("Error updating symptom status:", error);
    }
  };

  const areAllSymptomsCured = (disease: string) => {
    const symptoms =
      riskAssessment
        .flatMap((ra) => ra.diseases)
        .find((d) => d.predictedDisease === disease)?.symptoms || [];

    return symptoms.every((symptom) => curedSymptoms.has(symptom));
  };

  const handleGenerateReport = async () => {
    try {
      // Fetch complete symptom data for the selected disease
      const response = await fetch(`/api/symptom-tracking/${selectedDisease}`);
      if (!response.ok) {
        throw new Error("Failed to fetch report data");
      }

      const reportData = await response.json();

      // Generate the report
      const pdfBlob = await generateReport(reportData);

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedDisease}-report-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating report:", error);
      // Add appropriate error handling/user notification here
    }
  };

  useEffect(() => {
    fetchRiskAssessment();
    fetchTrackingData();
  }, []);

  const fetchRiskAssessment = async () => {
    try {
      const response = await fetch("/api/ai-risk-assessment");
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setRiskAssessment(data);
          // Initialize ratings for each symptom
          const initialRatings = data[0].diseases.reduce(
            (acc: any, disease: Disease) => {
              disease.symptoms.forEach((symptom) => {
                acc[symptom] = 5;
              });
              return acc;
            },
            {}
          );
          setRating(initialRatings);
        }
      }
    } catch (error) {
      console.error("Error fetching risk assessment:", error);
    }
  };

  const fetchTrackingData = async () => {
    try {
      const response = await fetch("/api/symptom-tracking");
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setTrackingData(data);
        }
      }
    } catch (error) {
      console.error("Error fetching tracking data:", error);
    }
  };

  const getSeverity = (rating: number): "Low" | "Medium" | "High" => {
    if (rating <= 3) return "Low";
    if (rating <= 7) return "Medium";
    return "High";
  };

  const handleSave = async (symptom: string) => {
    try {
      const response = await fetch("/api/symptom-tracking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          diseaseName: selectedDisease,
          symptom,
          estimatedDays: riskAssessment
            .flatMap((ra) => ra.diseases)
            .find((disease) => disease.predictedDisease === selectedDisease)
            ?.recoveryDays,
          score: rating[symptom],
          severity: getSeverity(rating[symptom]),
        }),
      });

      if (response.ok) {
        await fetchTrackingData();
      }
    } catch (error) {
      console.error("Error saving tracking data:", error);
    }
  };

  const getChartData = (symptom: string) => {
    const logs =
      trackingData.find((data) => data.symptom === symptom)?.dailyLogs || [];
    return logs.map((log) => ({
      date: new Date(log.date).toLocaleDateString(),
      score: log.score,
    }));
  };

  const filteredSymptoms = selectedDisease
    ? riskAssessment
        .flatMap((ra) => ra.diseases)
        .find((disease) => disease.predictedDisease === selectedDisease)
        ?.symptoms || []
    : [];

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Symptom Tracker</h1>
      {selectedDisease && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Disease Progress</CardTitle>
            <CardDescription>
              {curedSymptomsList[selectedDisease]?.join(", ") || "No symptoms cured yet"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Disease: {selectedDisease}</p>
                <p className="text-sm text-muted-foreground">
                  {areAllSymptomsCured(selectedDisease)
                    ? "All symptoms cured!"
                    : "Recovery in progress..."}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleGenerateReport}
                disabled={!areAllSymptomsCured(selectedDisease)}
              >
                Generate Recovery Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex gap-4">
        {riskAssessment
          .flatMap((ra) => ra.diseases)
          .map((disease) => (
            <Button
              key={disease.predictedDisease}
              variant={
                selectedDisease === disease.predictedDisease
                  ? "default"
                  : "outline"
              }
              onClick={() => setSelectedDisease(disease.predictedDisease)}
            >
              {disease.predictedDisease}
            </Button>
          ))}
      </div>
      <div className="space-y-4">
        {filteredSymptoms
          .filter((symptom) => !curedSymptoms.has(symptom))
          .map((symptom) => (
            <Card key={symptom} className="p-6">
              <div className="flex gap-6">
                {/* First Column - Graph */}
                <div className="flex-1">
                  <ChartContainer config={chartConfig}>
                    <LineChart
                      width={400}
                      height={300}
                      data={getChartData(symptom)}
                      margin={{ left: 12, right: 12 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Line
                        dataKey="score"
                        type="linear"
                        stroke="var(--color-desktop)"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "var(--color-desktop)" }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>

                {/* Second Column - Patient Details */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <p>
                      <strong>Disease Name:</strong> {selectedDisease}
                    </p>
                    <p>
                      <strong>Symptom:</strong> {symptom}
                    </p>
                    <p>
                      <strong>Estimated Day:</strong>{" "}
                      {
                        riskAssessment
                          .flatMap((ra) => ra.diseases)
                          .find(
                            (disease) =>
                              disease.predictedDisease === selectedDisease
                          )?.recoveryDays
                      }
                    </p>
                    <p>
                      <strong>Follow up Steps:</strong>{" "}
                      {riskAssessment
                        .flatMap((ra) => ra.diseases)
                        .find(
                          (disease) =>
                            disease.predictedDisease === selectedDisease
                        )
                        ?.followUpSteps.join(", ")}
                    </p>
                  </div>
                </div>

                {/* Third Column - Rating and Severity */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <p>
                          <strong>Rating</strong>
                        </p>
                        <p className="text-muted-foreground">
                          Score: {rating[symptom]}/10
                        </p>
                      </div>
                      <Slider
                        defaultValue={[5]}
                        max={10}
                        step={1}
                        onValueChange={(value) =>
                          setRating((prev) => ({
                            ...prev,
                            [symptom]: value[0],
                          }))
                        }
                      />
                    </div>

                    <div>
                      <p className="mb-2">
                        <strong>Current Severity</strong>
                      </p>
                      <div className="flex gap-2">
                        {["Low", "Medium", "High"].map((severity) => (
                          <span
                            key={severity}
                            className={`px-3 py-1 rounded-md text-sm ${
                              getSeverity(rating[symptom]) === severity
                                ? severity === "Low"
                                  ? "bg-green-100 text-green-800 font-bold"
                                  : severity === "Medium"
                                  ? "bg-orange-100 text-orange-800 font-bold"
                                  : "bg-red-100 text-red-800 font-bold"
                                : severity === "Low"
                                ? "bg-green-50 text-green-600"
                                : severity === "Medium"
                                ? "bg-orange-50 text-orange-600"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {severity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button onClick={() => handleSave(symptom)}>
                      Save Daily Log
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleCure(symptom)}
                    >
                      Cured
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
      </div>

      {selectedDisease && areAllSymptomsCured(selectedDisease) && (
        <Card className="p-6 mt-4">
          <CardHeader>
            <CardTitle>All Symptoms Cured!</CardTitle>
            <CardDescription>
              You have marked all symptoms as cured for {selectedDisease}.
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default SymptomTrackingContent;
