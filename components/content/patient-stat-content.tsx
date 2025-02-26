"use client";

import { useState, useMemo, useEffect } from "react";
import HealthMonitoringContent from "@/components/content/health-monitoring-content";
import { useRouter } from "next/navigation"; // Add this import
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Priority = "low" | "medium" | "high";

// Update the types to match processed data
type ProcessedTrackingData = {
  patientEmail: string;
  diseaseName: string;
  symptoms: string[];
  severity: string;
  allSeverities: string[];
};

type SymptomTrackingData = {
  patientEmail: string;
  diseaseName: string;
  symptom: string;
  estimatedDays: number;
  isCured: boolean;
  dailyLogs: {
    date: string;
    score: number;
    severity: "Low" | "Medium" | "High";
  }[];
  createdAt: string;
};

const priorityMap = {
  low: { label: "Low Priority", className: "text-green-700 bg-green-100" },
  medium: {
    label: "Medium Priority",
    className: "text-yellow-700 bg-yellow-100",
  },
  high: {
    label: "High Priority",
    className: "text-red-700 bg-red-100",
  },
};

// Add utility function for calculating mode
const getMode = (arr: string[]): string => {
  if (!arr || arr.length === 0) return "N/A";
  const frequency: { [key: string]: number } = {};
  let maxFreq = 0;
  let mode = arr[0];

  arr.forEach((item) => {
    if (!item) return;
    frequency[item] = (frequency[item] || 0) + 1;
    if (frequency[item] > maxFreq) {
      maxFreq = frequency[item];
      mode = item;
    }
  });

  return mode;
};

export default function PatientDashboard() {
  const router = useRouter(); // Add this line
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<ProcessedTrackingData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  // Add new function to process and combine data
  const processTrackingData = (
    data: SymptomTrackingData[]
  ): ProcessedTrackingData[] => {
    const diseaseMap = new Map<string, ProcessedTrackingData>();

    data.forEach((tracking) => {
      const latestSeverity =
        tracking.dailyLogs[tracking.dailyLogs.length - 1]?.severity || "N/A";

      if (diseaseMap.has(tracking.diseaseName)) {
        const existing = diseaseMap.get(tracking.diseaseName)!;
        if (!existing.symptoms.includes(tracking.symptom)) {
          existing.symptoms.push(tracking.symptom);
        }
        existing.allSeverities.push(latestSeverity);
      } else {
        diseaseMap.set(tracking.diseaseName, {
          patientEmail: tracking.patientEmail,
          diseaseName: tracking.diseaseName,
          symptoms: [tracking.symptom],
          severity: latestSeverity,
          allSeverities: [latestSeverity],
        });
      }
    });

    return Array.from(diseaseMap.values()).map((item) => ({
      ...item,
      severity: getMode(item.allSeverities),
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/symptom-tracking");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received");
        }

        const processedData = processTrackingData(data);
        setTrackingData(processedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  const priorityOrder = { high: 3, medium: 2, low: 1 };

  // Custom sorting function for priority
  const sortByPriority = (
    a: { priority: keyof typeof priorityOrder },
    b: { priority: keyof typeof priorityOrder }
  ) => {
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  };

  // Filtered and sorted data
  const filteredAndSortedData = useMemo(() => {
    const filtered = trackingData.filter((tracking) => {
      const severityMatch =
        priorityFilter === "all" ||
        tracking.severity.toLowerCase() === priorityFilter;

      const searchMatch =
        searchTerm === "" ||
        tracking.patientEmail
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        tracking.symptoms.some((s) =>
          s.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        tracking.diseaseName.toLowerCase().includes(searchTerm.toLowerCase());

      return severityMatch && searchMatch;
    });

    if (sortConfig !== null) {
      return [...filtered].sort((a, b) => {
        const getSortValue = (item: ProcessedTrackingData) => {
          switch (sortConfig.key) {
            case "severity":
              return item.severity.toLowerCase();
            case "disease":
              return item.diseaseName;
            case "patient":
              return item.patientEmail;
            default:
              return "";
          }
        };

        const aValue = getSortValue(a);
        const bValue = getSortValue(b);

        return sortConfig.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      });
    }

    return filtered;
  }, [trackingData, searchTerm, sortConfig, priorityFilter]);

  // Add this function to handle dashboard navigation
  const handleViewDashboard = (patientEmail: string) => {
    setSelectedPatient(patientEmail);
  };

  // Add handleBack function
  const handleBack = () => {
    setSelectedPatient(null);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading patient data...</div>
      </div>
    );
  }

  if (!trackingData || trackingData.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">No patient data available</div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-xl border-0">
      {selectedPatient ? (
        <>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-t-xl border-b border-blue-100 dark:border-gray-600">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                onClick={handleBack}
              >
                ← Back
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-300 tracking-tight">
                  Patient Dashboard
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedPatient}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <HealthMonitoringContent patientEmail={selectedPatient} />
          </CardContent>
        </>
      ) : (
        <>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-t-xl border-b border-blue-100 dark:border-gray-600">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-300 tracking-tight">
                Patient Management Dashboard
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Monitor and manage your patients conditions and treatments
              </p>
            </div>
            <Avatar className="h-12 w-12 ring-2 ring-blue-500 dark:ring-blue-400 shadow-lg transition-transform hover:scale-105">
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="Doctor"
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-r from-blue-400 to-blue-600 text-white">
                DR
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4 mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <Input
                placeholder="Search patients..."
                className="max-w-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:border-blue-400 focus:border-blue-500 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm hover:border-blue-400 focus:border-blue-500 transition-colors">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                  <TableRow>
                    <TableHead className="w-[80px] px-4">
                      <Button
                        variant="ghost"
                        onClick={() => sortData("id")}
                        className="flex items-center gap-1 text-blue-700 dark:text-blue-300"
                      >
                        Sr No
                        <CaretSortIcon className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[300px] px-4">
                      <Button
                        variant="ghost"
                        onClick={() => sortData("patient")}
                        className="flex items-center gap-1 text-blue-700 dark:text-blue-300"
                      >
                        Patient
                        <CaretSortIcon className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[200px] px-4">
                      <Button
                        variant="ghost"
                        onClick={() => sortData("disease")}
                        className="flex items-center gap-1 text-blue-700 dark:text-blue-300"
                      >
                        Disease
                        <CaretSortIcon className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[150px] px-4">
                      <Button
                        variant="ghost"
                        onClick={() => sortData("severity")}
                        className="flex items-center gap-1 text-blue-700 dark:text-blue-300"
                      >
                        Severity
                        <CaretSortIcon className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[150px] px-4">Dashboard</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedData.map((tracking, index) => {
                    const severity = tracking.severity.toLowerCase() as Priority;

                    return (
                      <TableRow
                        key={index}
                        className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                      >
                        <TableCell className="font-medium text-gray-700 dark:text-gray-300 px-4">
                          {index + 1}
                        </TableCell>
                        <TableCell className="px-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 dark:text-gray-200">
                                {tracking.patientEmail}
                              </span>
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-medium">
                              {tracking.symptoms.join(", ")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge
                            variant="secondary"
                            className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 px-3 py-1 rounded-full font-medium shadow-sm"
                          >
                            {tracking.diseaseName}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4">
                          <div
                            className={`font-medium px-3 py-1.5 rounded-full text-sm ${priorityMap[severity]?.className} shadow-sm transition-all duration-200 hover:shadow-md flex items-center justify-center text-center`}
                          >
                            {tracking.severity}
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <Button 
                            variant="outline"
                            className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-sm hover:shadow-md transition-all duration-200 w-full"
                            onClick={() => handleViewDashboard(tracking.patientEmail)}
                          >
                            View Dashboard
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Showing {filteredAndSortedData.length} patients
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Rows per page</p>
                  <Select defaultValue="10">
                    <SelectTrigger className="w-[70px] bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                      <SelectValue placeholder="10" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="40">40</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Page 1 of 1
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  >
                    {"<<"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  >
                    {"<"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  >
                    {">"}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled
                    className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  >
                    {">>"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}
