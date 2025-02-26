"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Thermometer,
  Home,
  Droplet,
  Heart,
  Brain,
  User2,
  Pill,
  TestTube,
  Sparkles,
  Calendar,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Label,
  Pie,
  PieChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MentalHealthData {
  mentalFitnessScore: number;
  voiceAnalysis: {
    Smoothness: string;
    Control: string;
    Liveliness: string;
    Energy_range: string;
    Clarity: string;
    Crispness: string;
    Speech: string;
    Pause: string;
  };
}

// Add this interface near the top with other interfaces
interface Appointment {
  doctorName: string;
  specialization: string;
  appointmentDate: string;
  timeSlot: string;
}

// Add this interface after the existing interfaces
interface LabTest {
  diseaseId: string;
  riskScore: number;
  timestamp: Date;
}

// Sample data
const heartRateData = [
  { week: "Week 1", value: 72 },
  { week: "Week 2", value: 90 },
  { week: "Week 3", value: 70 },
  { week: "Week 4", value: 68 },
];

const spo2Data = [
  { week: "Week 1", value: 96 },
  { week: "Week 2", value: 97 },
  { week: "Week 3", value: 95 },
  { week: "Week 4", value: 100 },
];

const medicationsData = [{ name: "Aspirin", dosage: "81mg", time: "8:00 AM" }];

const chartConfig = {
  heartRate: {
    label: "Heart Rate",
    color: "hsl(var(--chart-1))",
  },
  spo2: {
    label: "SPO2",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const healthChartData = [
  { status: "Normal", value: 275, fill: "hsl(var(--chart-1))" },
  { status: "Warning", value: 200, fill: "hsl(var(--chart-2))" },
  { status: "Critical", value: 100, fill: "hsl(var(--chart-3))" },
];

const healthChartConfig = {
  total: {
    label: "Total Metrics",
  },
  normal: {
    label: "Normal",
    color: "hsl(var(--chart-1))",
  },
  warning: {
    label: "Warning",
    color: "hsl(var(--chart-2))",
  },
  critical: {
    label: "Critical",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

// Add this helper function at the top level
const getChartColor = (index: number) => `hsl(var(--chart-${(index % 9) + 1}))`;

interface HealthMonitoringContentProps {
  patientEmail: string;
}

const HealthMonitoringContent = ({
  patientEmail,
}: HealthMonitoringContentProps) => {
  const [selectedWeek, setSelectedWeek] = useState("Week 3");
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mentalHealthData, setMentalHealthData] =
    useState<MentalHealthData | null>(null);
  const [data, setData] = useState({
    roomTemperature: "N/A",
    roomHumidity: "N/A",
    heartRate: "N/A",
    bloodOxygen: "N/A",
    bodyTemperature: "N/A",
  });
  // Add this state for appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // Add this state for lab tests
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  // Improved type safety for lastAlertTime
  const [lastAlertTime, setLastAlertTime] = useState<{ [key: string]: number }>(
    {}
  );
  const ALERT_COOLDOWN = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Enhanced cooldown check with strict timing
  const canSendAlert = (type: string): boolean => {
    const currentTime = Date.now();
    const lastAlert = lastAlertTime[type] || 0;
    const timeSinceLastAlert = currentTime - lastAlert;

    // Strict comparison to ensure full cooldown period has passed
    if (timeSinceLastAlert < ALERT_COOLDOWN) {
      const remainingTime = Math.ceil(
        (ALERT_COOLDOWN - timeSinceLastAlert) / 1000
      );
      console.log(
        `Cooldown active for ${type}. ${remainingTime} seconds remaining.`
      );
      return false;
    }
    return true;
  };

  // Updated alert sending function with strict cooldown enforcement
  const sendHealthAlert = async (type: string, value: number) => {
    // Early return if value is invalid
    if (!value || value === 0) {
      console.log(`Invalid ${type} value detected: ${value}. Alert not sent.`);
      return;
    }

    // Strict cooldown check before proceeding
    if (!canSendAlert(type)) {
      return;
    }

    try {
      const message =
        type === "heartRate"
          ? `⚠️ HEALTH ALERT: High Heart Rate detected! Current BPM: ${value}. Please check on the patient.`
          : `⚠️ HEALTH ALERT: Low Blood Oxygen detected! Current SpO2: ${value}%. Immediate attention may be required.`;

      const response = await fetch("/api/send-health-alert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "8261961156",
          message,
        }),
      });

      if (response.ok) {
        // Immediately update the timestamp when alert is successfully sent
        const currentTime = Date.now();
        setLastAlertTime((prev) => ({
          ...prev,
          [type]: currentTime,
        }));
        console.log(
          `Alert sent for ${type}. Next alert available in 5 minutes.`
        );
      }
    } catch (error) {
      console.error("Failed to send health alert:", error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://172.16.248.23/data");
        const jsonData = await response.json();

        // Validate sensor data before sending alerts
        if (typeof jsonData.BPM === "number" && jsonData.BPM > 0) {
          if (jsonData.BPM > 100) {
            await sendHealthAlert("heartRate", jsonData.BPM);
          }
        }

        if (typeof jsonData.SpO2 === "number" && jsonData.SpO2 > 0) {
          if (jsonData.SpO2 < 88) {
            await sendHealthAlert("spo2", jsonData.SpO2);
          }
        }

        // Update state with the ESP32 sensor values
        setData({
          roomTemperature: jsonData.temperature.toFixed(1) + " °C",
          roomHumidity: jsonData.humidity.toFixed(1) + " %",
          heartRate: jsonData.BPM > 0 ? jsonData.BPM + " BPM" : "N/A",
          bloodOxygen: jsonData.SpO2 > 0 ? jsonData.SpO2 + " %" : "N/A",
          bodyTemperature: jsonData.bodyTemperature.toFixed(1) + " °C",
        });
      } catch (error) {
        console.error("Error fetching ESP32 data:", error);
      }
    };

    fetchData();

    // Polling every 1 second
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [patientEmail]);

  useEffect(() => {
    const fetchMentalHealthData = async () => {
      try {
        const response = await fetch("/api/mental-health/latest");
        const data = await response.json();
        setMentalHealthData(data);
      } catch (error) {
        // console.error("Error fetching mental health data:", error);
      }
    };

    fetchMentalHealthData();
  }, []);

  // Add this useEffect for fetching appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch("/api/appointments");
        const data = await response.json();
        setAppointments(data);
      } catch (error) {
        // console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  // Add this useEffect for fetching lab tests
  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        const response = await fetch("/api/lab-tests");
        const data = await response.json();
        setLabTests(data);
      } catch (error) {
        // console.error("Error fetching lab tests:", error);
      }
    };

    fetchLabTests();
  }, []);

  const renderChart = (data: typeof heartRateData) => {
    if (!isMounted) return null;

    return (
      <ChartContainer
        config={chartConfig}
        className="flex items-center justify-center w-full"
      >
        <LineChart
          accessibilityLayer
          data={data}
          width={350}
          height={250}
          margin={{
            left: 25,
            right: 25,
            top: 10,
            bottom: 20,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="week"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis domain={[0, "dataMax + 10"]} tickMargin={8} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey="value"
            type="natural"
            stroke={chartConfig.heartRate.color}
            strokeWidth={2}
            dot={{
              fill: chartConfig.heartRate.color,
              r: 4,
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ChartContainer>
    );
  };

  // const totalHealthMetrics = React.useMemo(() => {
  //   return healthChartData.reduce((acc, curr) => acc + curr.value, 0);
  // }, []);

  // Transform voice analysis data for pie chart
  const voiceAnalysisChartData = React.useMemo(() => {
    if (!mentalHealthData?.voiceAnalysis) return [];

    return Object.entries(mentalHealthData.voiceAnalysis).map(
      ([key, value], index) => ({
        name: key,
        value: value, // The string value will be shown in tooltip
        fill: getChartColor(index), // Use predefined chart colors
        displayValue: 1, // Equal sized segments
      })
    );
  }, [mentalHealthData]);

  // Replace the existing healthChartData definition with this
  const healthChartConfig = {
    voice: {
      label: "Voice Analysis",
      color: getChartColor(0),
    },
  } satisfies ChartConfig;

  // Modify the Mental Health Overview card content
  const renderMentalHealthChart = () => (
    <ChartContainer
      config={healthChartConfig}
      className="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart>
        <ChartTooltip
          content={({ payload }) => {
            if (payload && payload[0]) {
              const data = payload[0].payload;
              return (
                <div className="rounded-lg bg-white p-2 shadow-md">
                  <div className="font-semibold" style={{ color: data.fill }}>
                    {data.name}: {data.value}
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Pie
          data={voiceAnalysisChartData}
          dataKey="displayValue"
          nameKey="name"
          innerRadius={60}
          outerRadius={85}
          strokeWidth={4}
        >
          <Label
            content={({ viewBox }) => {
              if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox))
                return null;
              return (
                <text
                  x={viewBox.cx}
                  y={viewBox.cy}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  <tspan
                    x={viewBox.cx}
                    y={viewBox.cy}
                    className="fill-foreground text-3xl font-bold"
                  >
                    {mentalHealthData?.mentalFitnessScore || 0}
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    y={(viewBox.cy || 0) + 24}
                    className="fill-muted-foreground"
                  >
                    Score
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );

  const filteredAppointments = appointments
    .filter((apt) => new Date(apt.appointmentDate) > new Date())
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime()
    )
    .slice(0, 2);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Heart Rate Chart */}
        <Card
          className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg flex flex-col h-300px] bg-gradient-to-br from-red-100/90 via-red-50/50 to-white"
          onMouseEnter={() => setHoveredCard("heart")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-4">
              <CardTitle className="text-red-600 flex items-center gap-2 text-xl font-bold">
                <Heart className="h-6 w-6" />
                {chartConfig.heartRate.label}
              </CardTitle>
              <span className="text-lg font-semibold text-red-600">
                {data.heartRate}
              </span>
            </div>
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select Week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Week 1">Week 1</SelectItem>
                <SelectItem value="Week 2">Week 2</SelectItem>
                <SelectItem value="Week 3">Week 3</SelectItem>
                <SelectItem value="Week 4">Week 4</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            {renderChart(heartRateData)}
          </CardContent>
        </Card>

        {/* SPO2 Chart */}
        <Card
          className="transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg flex flex-col h-[300px] bg-gradient-to-br from-sky-100/90 via-sky-50/50 to-white"
          onMouseEnter={() => setHoveredCard("spo2")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-4">
              <CardTitle className="text-blue-600 flex items-center gap-2 text-xl font-bold">
                <Droplet className="h-6 w-6" />
                SpO<sub>2</sub>
              </CardTitle>
              <span className="text-lg font-semibold text-blue-600">
                {data.bloodOxygen}
              </span>
            </div>
            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select Week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Week 1">Week 1</SelectItem>
                <SelectItem value="Week 2">Week 2</SelectItem>
                <SelectItem value="Week 3">Week 3</SelectItem>
                <SelectItem value="Week 4">Week 4</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center">
            {renderChart(spo2Data)}
          </CardContent>
        </Card>

        {/* Temperature and Humidity Cards */}
        <div className="grid grid-rows-3 gap-4 h-[300px]">
          {[
            {
              title: "Body Temperature",
              value: data.bodyTemperature,
              icon: Thermometer,
              id: "temp",
              bgColor:
                "bg-gradient-to-br from-amber-100/90 via-amber-50/50 to-white",
              iconColor: "text-orange-600",
              textColor: "text-orange-800",
            },
            {
              title: "Room Temperature",
              value: data.roomTemperature,
              icon: Home,
              id: "room",
              bgColor:
                "bg-gradient-to-br from-emerald-100/90 via-emerald-50/50 to-white",
              iconColor: "text-green-600",
              textColor: "text-green-800",
            },
            {
              title: "Humidity",
              value: data.roomHumidity,
              icon: Droplet,
              id: "humidity",
              bgColor:
                "bg-gradient-to-br from-blue-100/90 via-blue-50/50 to-white",
              iconColor: "text-cyan-600",
              textColor: "text-cyan-800",
            },
          ].map((metric) => (
            <Card
              key={metric.id}
              className={`transition-all duration-200 hover:scale-[1.02] hover:shadow-lg h-full ${metric.bgColor}`}
              onMouseEnter={() => setHoveredCard(metric.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex flex-row items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <metric.icon
                      className={`h-5 w-5 ${
                        hoveredCard === metric.id
                          ? metric.iconColor
                          : "text-muted-foreground"
                      }`}
                    />
                    <CardTitle
                      className={`text-base md:text-lg font-medium ${metric.textColor}`}
                    >
                      {metric.title}
                    </CardTitle>
                  </div>
                  <div
                    className={`text-xl md:text-2xl font-bold ${metric.textColor}`}
                  >
                    {metric.value}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Status Overview */}
        <Card
          className="flex flex-col h-[420px] transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br from-fuchsia-100/90 via-fuchsia-50/50 to-white"
          onMouseEnter={() => setHoveredCard("health-status")}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-purple-600 flex items-center gap-2 text-xl font-bold">
              <Brain className="h-6 w-6" />
              Mental Health Overview
            </CardTitle>
            <CardDescription>Last Reading</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {renderMentalHealthChart()}
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              Health metrics improved by 3.8% <TrendingUp className="h-4 w-4" />
            </div>
            <div className="leading-none text-muted-foreground">
              Based on your last 30 days of health data
            </div>
          </CardFooter>
        </Card>

        {/* Appointments and Lab Tests */}
        <div className="flex flex-col gap-4 h-[400px]">
          <Card
            className="flex-1 transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br from-violet-100/90 via-violet-50/50 to-white"
            onMouseEnter={() => setHoveredCard("appointments")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-teal-600 flex items-center gap-2 text-xl font-bold">
                <Calendar className="h-6 w-6" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="space-y-4 h-[140px] overflow-y-auto pr-2 scrollbar-none"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {filteredAppointments.map((appointment, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <User2 className="h-5 w-5 text-indigo-600" />
                      <div>
                        <p className="font-medium">{appointment.doctorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-right">
                      <p>
                        {new Date(
                          appointment.appointmentDate
                        ).toLocaleDateString()}
                      </p>
                      <p>{appointment.timeSlot}</p>
                    </div>
                  </div>
                ))}
                {appointments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    No upcoming appointments
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card
            className="flex-1 transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br from-cyan-100/90 via-cyan-50/50 to-white"
            onMouseEnter={() => setHoveredCard("lab-tests")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-teal-600 flex items-center gap-2 text-xl font-bold">
                <TestTube className="h-6 w-6" />
                Lab Tests Results
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[115px] overflow-hidden">
              <div
                className="h-full overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {labTests.length > 0 ? (
                  labTests.map((test, i) => (
                    <div
                      key={i}
                      className={`flex justify-between items-center  ${
                        i === labTests.length - 1 ? "" : "mb-1"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{test.diseaseId}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(test.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-sm text-right">
                        <p>Risk Score: {test.riskScore}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center">
                    No lab test results available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medications and AI Insights */}
        <div className="flex flex-col gap-4 h-[400px]">
          <Card
            className="flex-1 transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br from-rose-100/90 via-rose-50/50 to-white"
            onMouseEnter={() => setHoveredCard("medication")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-pink-600 flex items-center gap-2 text-xl font-bold">
                <Pill className="h-6 w-6" />
                Next Medication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 h-[140px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {medicationsData.map((medication, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-xl font-bold">{medication.name}</p>
                    <p className="text-muted-foreground">
                      Dosage: {medication.dosage}
                    </p>
                    <p className="text-muted-foreground">
                      Time: {medication.time}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card
            className="flex-1 transition-transform duration-200 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-br from-yellow-100/90 via-yellow-50/50 to-white"
            onMouseEnter={() => setHoveredCard("ai-insights")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <CardHeader>
              <CardTitle className="text-amber-600 flex items-center gap-2 text-xl font-bold">
                <Sparkles className="h-6 w-6" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Vitals normal. Increase daily activity recommended.
                </p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">
                    Improving trend detected
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthMonitoringContent;
