"use client";

import { useState, useRef } from "react"; // Add useRef import
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import html2canvas from "html2canvas"; // Add this import

interface Plan {
  id: number;
  name: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  cost: number;
  meals: Array<{
    day: number;
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string[];
  }>;
}

interface SelectedPlanProps {
  plan: Plan;
  onBack: () => void;
}

export function SelectedPlan({ plan, onBack }: SelectedPlanProps) {
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!pdfContentRef.current) return null;

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

      // Calculate dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 40;
      const availableWidth = pageWidth - margin * 2;
      const aspectRatio = canvas.height / canvas.width;
      const imgHeight = availableWidth * aspectRatio;

      // Add the image to PDF
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        margin,
        margin,
        availableWidth,
        imgHeight
      );

      // Add footer
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      const footerText = `Generated on: ${new Date().toLocaleDateString()}`;
      pdf.text(footerText, margin, pageHeight - margin);

      return pdf;
    } catch (error) {
      console.error("PDF generation error:", error);
      return null;
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const pdf = await generatePDF();
      if (pdf) {
        pdf.save(
          `${plan.name.toLowerCase().replace(/\s+/g, "-")}-diet-plan.pdf`
        );
      }
    } finally {
      setDownloading(false);
    }
  };

  const sendEmail = async () => {
    setSending(true);
    try {
      const pdf = await generatePDF();
      if (!pdf) return;

      const pdfBlob = pdf.output("blob");
      const formData = new FormData();
      formData.append("pdf", pdfBlob, "diet-plan.pdf");

      const response = await fetch("/api/send-email", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      alert(`Diet plan sent to email: ${data.sentTo}`);
    } catch (error) {
      console.error("Email sending error:", error);
      alert("Failed to send email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">
        <Button
          variant="outline"
          onClick={onBack}
          className="hover:bg-violet-50 border-violet-200"
        >
          ← Back to Plans
        </Button>
        <div className="flex gap-4">
          <Button
            onClick={sendEmail}
            disabled={sending}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
          >
            {sending ? "Sending..." : "Send to Email"}
          </Button>
          <Button
            onClick={downloadPDF}
            disabled={downloading}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
          >
            {downloading ? "Generating PDF..." : "Download Plan"}
          </Button>
        </div>
      </div>

      <div ref={pdfContentRef}>
        <Card className="border-violet-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-t-xl">
            <CardTitle className="text-2xl text-violet-800">
              {plan.name}
            </CardTitle>
            <CardDescription className="text-violet-600 font-medium">
              {plan.calories} calories | ₹{plan.cost}/week
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              <div className="grid grid-cols-3 gap-6 p-6 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl">
                <div>
                  <div className="font-medium">Protein</div>
                  <div className="text-2xl">{plan.macros.protein}%</div>
                </div>
                <div>
                  <div className="font-medium">Carbs</div>
                  <div className="text-2xl">{plan.macros.carbs}%</div>
                </div>
                <div>
                  <div className="font-medium">Fat</div>
                  <div className="text-2xl">{plan.macros.fat}%</div>
                </div>
              </div>

              <div className="space-y-8">
                {plan.meals.map((meal) => (
                  <div key={meal.day} className="space-y-4">
                    <h3 className="text-xl font-semibold text-violet-800">
                      Day {meal.day}
                    </h3>
                    <div className="grid gap-6 p-6 bg-gray-50 rounded-xl shadow-inner">
                      <div>
                        <div className="font-medium">Breakfast</div>
                        <div>{meal.breakfast}</div>
                      </div>
                      <div>
                        <div className="font-medium">Lunch</div>
                        <div>{meal.lunch}</div>
                      </div>
                      <div>
                        <div className="font-medium">Dinner</div>
                        <div>{meal.dinner}</div>
                      </div>
                      <div>
                        <div className="font-medium">Snacks</div>
                        <div>{meal.snacks.join(", ")}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
