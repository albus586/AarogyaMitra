"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Mic, MicOff, Download, Edit2, Check, X, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface MedicineRow {
  "Sr.No": string | number;
  "Medicine Name": string;
  "Dosage Time": string;
  Instruction: string;
}

interface PrescriptionData {
  prescriptionId: string;
  hospital_name?: string;
  doctor_name?: string;
  patient_name?: string;
  date?: string;
  prescription_duration?: number; // Changed to number
  medicine_table: MedicineRow[];
  userEmail?: string;
}

interface PrescriptionContentProps {
  patient: {
    _id: string;
    patientName: string;
    patientEmail: string;
    appointmentDate: string;
    timeSlot: string;
    appointmentStatus: string;
    prescriptionStatus: string;
    reason: string;
  };
}

const getTimeRange = (timing: string) => {
  switch (timing.toLowerCase()) {
    case "morning":
      return "8 am to 11 am";
    case "afternoon":
      return "12 pm to 3 pm";
    case "evening":
      return "4 pm to 7 pm";
    case "night":
      return "8 pm to 11 pm";
    default:
      return "";
  }
};

export function PrescriptionContent({ patient }: PrescriptionContentProps) {
  const [recording, setRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [responseJson, setResponseJson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedValues, setEditedValues] = useState<Partial<MedicineRow>>({});
  const [canUpload, setCanUpload] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [doctorName, setDoctorName] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const prescriptionRef = useRef<HTMLDivElement>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  useEffect(() => {
    const fetchDoctorName = async () => {
      try {
        const response = await fetch("/api/auth/user");
        const data = await response.json();
        if (data.name) {
          setDoctorName(data.name);
        }
      } catch (error) {
        console.error("Failed to fetch doctor name:", error);
      }
    };

    fetchDoctorName();
  }, []);

  useEffect(() => {
    // Fetch prescription data for the patient if needed
  }, [patient]);

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);
        setCanUpload(true);

        const audioURL = URL.createObjectURL(audioBlob);
        setAudioURL(audioURL);

        audioChunksRef.current = [];
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setRecording(true);
      setCanUpload(false);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError(
        "Could not start recording. Please check your microphone permissions."
      );
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const uploadAudio = async () => {
    if (!audioBlob) {
      setError("No audio recorded.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.wav");

    try {
      const response = await fetch(
        "https://chronix-server-965346204364.asia-south1.run.app/prescription/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      setResponseJson(data);

      // Store prescription data in the database
      await storePrescriptionData(data);
    } catch (err: any) {
      setError(`Failed to upload audio: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const storePrescriptionData = async (data: any) => {
    const prescriptionData = parseMedicineData(data);
    if (!prescriptionData) {
      setError("Invalid prescription data.");
      return;
    }

    // Add userEmail and prescriptionId to prescriptionData
    prescriptionData.userEmail = patient.patientEmail;
    prescriptionData.prescriptionId = `${doctorName}_${patient.appointmentDate}`;

    try {
      const response = await fetch("/api/prescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prescriptionData),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Prescription stored successfully:", result);
    } catch (err: any) {
      setError(`Failed to store prescription data: ${err.message}`);
    }
  };

  const handleEdit = (index: number) => {
    if (prescriptionData?.medicine_table[index]) {
      setEditingRow(index);
      setEditedValues(prescriptionData.medicine_table[index]);
    }
  };

  const handleSave = (index: number) => {
    if (!prescriptionData) return;

    const updatedTable = [...prescriptionData.medicine_table];
    updatedTable[index] = editedValues as MedicineRow;

    const updatedPrescriptionData = {
      ...prescriptionData,
      medicine_table: updatedTable,
    };

    setResponseJson({
      ...responseJson,
      data: `\`\`\`json\n${JSON.stringify(
        updatedPrescriptionData,
        null,
        2
      )}\n\`\`\``,
    });

    setEditingRow(null);
    setEditedValues({});
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedValues({});
  };

  const handleInputChange = (field: keyof MedicineRow, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const downloadPDF = async () => {
    if (!pdfContentRef.current) return;

    try {
      const canvas = await html2canvas(pdfContentRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const availableWidth = pageWidth - margin * 2;
      const aspectRatio = canvas.height / canvas.width;
      const imgHeight = availableWidth * aspectRatio;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        margin,
        margin,
        availableWidth,
        imgHeight
      );

      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      const footerText = `Generated on: ${new Date().toLocaleDateString()}`;
      pdf.text(footerText, margin, pageHeight - margin);

      const pdfBlob = pdf.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "prescription.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Failed to download PDF");
    }
  };

  const storePrescriptionAsReport = async () => {
    if (!pdfContentRef.current || !prescriptionData) return;

    try {
      const canvas = await html2canvas(pdfContentRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });

      const imageUrl = canvas.toDataURL("image/png");

      // Create report data
      const reportData = {
        userEmail: patient.patientEmail, // Patient's email
        title: `Prescription for ${patient.patientName}`,
        filename: `prescription_${new Date().toISOString()}.png`,
        description: `Prescription issued by ${
          prescriptionData.doctor_name || "Unknown"
        } for duration of ${
          prescriptionData.prescription_duration || 0
        } days dated ${
          prescriptionData.date || new Date().toLocaleDateString()
        }`,
        imageUrl: imageUrl,
      };

      // Add these console logs for debugging
      console.log("Patient email before fetch:", patient.patientEmail);
      console.log("Full report data before fetch:", reportData);

      // Use explicit JSON.stringify
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to store prescription as report"
        );
      }

      const result = await response.json();
      console.log("Response from server:", result);

      alert("Prescription has been saved to reports successfully!");
    } catch (err) {
      console.error("Error storing prescription:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to store prescription in reports"
      );
    }
  };

  const parseMedicineData = (response: any): PrescriptionData | null => {
    try {
      if (!response?.data) return null;
      const jsonMatch = response.data.match(/```json\n([\s\S]*)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        const parsedData = JSON.parse(jsonMatch[1]);
        // Modify specific parameters
        parsedData.date = new Date().toLocaleDateString();
        parsedData.doctor_name = doctorName; // Use logged-in doctor's name
        parsedData.patient_name = patient.patientName;
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error("Error parsing response:", error);
      return null;
    }
  };

  const prescriptionData = responseJson
    ? parseMedicineData(responseJson)
    : null;

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg">
      <CardHeader className="bg-blue-600 text-white p-4 rounded-t-lg">
        <CardTitle className="text-2xl font-bold">
          Prescription for {patient.patientName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 bg-gray-50 rounded-b-lg">
        <div className="flex items-center space-x-4">
          <Button
            onClick={recording ? stopRecording : startRecording}
            variant={recording ? "destructive" : "default"}
            className="flex items-center space-x-2"
          >
            {recording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
            <span>{recording ? "Stop Recording" : "Start Recording"}</span>
          </Button>

          {recording && (
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}

          <Button
            variant="default"
            onClick={uploadAudio}
            disabled={!audioBlob || !canUpload || isUploading}
            className="flex items-center space-x-2"
          >
            {isUploading ? (
              <>
                <span className="animate-spin">⌛</span>
                <span>Uploading...</span>
              </>
            ) : (
              <span>Upload Audio</span>
            )}
          </Button>

          {prescriptionData && (
            <div className="flex space-x-4">
              <Button
                onClick={downloadPDF}
                className="flex items-center space-x-2"
              >
                <Download className="h-5 w-5" />
                <span>Download PDF</span>
              </Button>
              <Button
                onClick={storePrescriptionAsReport}
                className="flex items-center space-x-2"
              >
                <Send className="h-5 w-5" />
                <span>Send to Patient</span>
              </Button>
            </div>
          )}
        </div>

        {audioURL && (
          <div className="mt-4">
            <audio
              controls
              src={audioURL}
              className="w-full rounded-lg shadow-md"
            />
          </div>
        )}

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {prescriptionData && (
          <div
            className="space-y-4 bg-white p-8 rounded-lg shadow-md"
            ref={prescriptionRef}
          >
            <div
              className="space-y-6 border p-6 rounded-lg shadow-sm"
              ref={pdfContentRef}
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 text-blue-600">
                  Medical Prescription
                </h1>
                {prescriptionData.hospital_name && (
                  <p className="text-xl text-gray-700">
                    {prescriptionData.hospital_name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  {prescriptionData.doctor_name && (
                    <p className="mb-2">
                      <span className="font-semibold">Doctor:</span>{" "}
                      {prescriptionData.doctor_name}
                    </p>
                  )}
                  {prescriptionData.date && (
                    <p className="mb-2">
                      <span className="font-semibold">Date:</span>{" "}
                      {prescriptionData.date}
                    </p>
                  )}
                  {prescriptionData.prescription_duration && (
                    <p className="mb-2">
                      <span className="font-semibold">Duration:</span>{" "}
                      {prescriptionData.prescription_duration}
                    </p>
                  )}
                </div>
                <div>
                  {prescriptionData.patient_name && (
                    <p className="mb-2">
                      <span className="font-semibold">Patient:</span>{" "}
                      {prescriptionData.patient_name}
                    </p>
                  )}
                </div>
              </div>

              {prescriptionData.medicine_table &&
                prescriptionData.medicine_table.length > 0 && (
                  <Table className="border-collapse border border-gray-200">
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="border p-3 text-left font-semibold">
                          Sr. No
                        </TableHead>
                        <TableHead className="border p-3 text-left font-semibold">
                          Medicine Name
                        </TableHead>
                        <TableHead className="border p-3 text-left font-semibold">
                          Dosage Timing
                        </TableHead>
                        <TableHead className="border p-3 text-left font-semibold">
                          Interval
                        </TableHead>
                        <TableHead className="border p-3 text-left font-semibold">
                          Instructions
                        </TableHead>
                        <TableHead className="border p-3 text-left font-semibold">
                          Manage
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prescriptionData.medicine_table.map(
                        (medicine, index) => (
                          <TableRow
                            key={medicine["Sr.No"]}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="border p-3">
                              {medicine["Sr.No"]}
                            </TableCell>
                            <TableCell className="border p-3">
                              {editingRow === index ? (
                                <Input
                                  value={
                                    (editedValues as MedicineRow)[
                                      "Medicine Name"
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "Medicine Name",
                                      e.target.value
                                    )
                                  }
                                  className="w-full"
                                />
                              ) : (
                                medicine["Medicine Name"]
                              )}
                            </TableCell>
                            <TableCell className="border p-3">
                              {editingRow === index ? (
                                <Input
                                  value={
                                    (editedValues as MedicineRow)[
                                      "Dosage Time"
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "Dosage Time",
                                      e.target.value
                                    )
                                  }
                                  className="w-full"
                                />
                              ) : (
                                medicine["Dosage Time"]
                              )}
                            </TableCell>
                            <TableCell className="border p-3">
                              {getTimeRange(medicine["Dosage Time"])}
                            </TableCell>
                            <TableCell className="border p-3">
                              {editingRow === index ? (
                                <Input
                                  value={
                                    (editedValues as MedicineRow)[
                                      "Instruction"
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      "Instruction",
                                      e.target.value
                                    )
                                  }
                                  className="w-full"
                                />
                              ) : (
                                medicine["Instruction"]
                              )}
                            </TableCell>
                            <TableCell className="border p-3">
                              {editingRow === index ? (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleSave(index)}
                                    className="flex items-center space-x-1"
                                  >
                                    <Check className="h-4 w-4" />
                                    <span>Save</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleCancel}
                                    className="flex items-center space-x-1"
                                  >
                                    <X className="h-4 w-4" />
                                    <span>Cancel</span>
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(index)}
                                  className="flex items-center space-x-1"
                                >
                                  <Edit2 className="h-4 w-4" />
                                  <span>Edit</span>
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
