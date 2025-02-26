import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Constants for styling
const COLORS = {
  primary: [22, 160, 133],
  secondary: [240, 240, 240],
  text: [51, 51, 51],
  headerText: [255, 255, 255]
};

const MARGINS = {
  top: 20,
  left: 20,
  right: 20,
  bottom: 20
};

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY2;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface ReportData {
  diseaseName: string;
  symptom: string;
  estimatedDays: number;
  dailyLogs: Array<{
    date: string;
    score: number;
    severity: string;
  }>;
  averageScore: number;
  highestSeverity: string;
  lowestSeverity: string;
  followUpSteps: string[];
  recoveryProgress: string;
  keyObservations: string;
}

const generatePrompt = (data: ReportData) => {
  const followUpSteps = data.followUpSteps
    ? data.followUpSteps.join("; ")
    : "None";
  
  return `Generate a concise yet comprehensive medical report using the following data. Keep each section brief but informative.
            
PATIENT DATA:
Disease: ${data.diseaseName}
Primary Symptom: ${data.symptom}
Duration: ${data.estimatedDays} days
Symptom Score Average: ${data.averageScore}
Severity Range: ${data.lowestSeverity} to ${data.highestSeverity}

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:

EXECUTIVE SUMMARY (2-3 sentences):
[Provide brief overview of condition and general progress]

SYMPTOM ANALYSIS (3-4 bullet points):
• [Include key symptom patterns]
• [Note severity trends]
• [Mention any triggers or correlations]

TREATMENT PROGRESS (2-3 sentences):
Recovery Status: ${data.recoveryProgress}

KEY OBSERVATIONS (2-3 bullet points):
${data.keyObservations}

RECOMMENDATIONS (3-4 brief points):
• [List specific action items]
• [Include lifestyle modifications]
• [Note any medication adjustments]

FOLLOW-UP PLAN:
${followUpSteps}

Keep the entire report under 400 words and maintain professional medical terminology throughout by following this report format strictly.`;
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString; // Return original string if parsing fails
  }
};

const callGroqAPI = async (prompt: string) => {
  try {
    if (!GROQ_API_KEY) {
      throw new Error("GROQ API key is not configured");
    }

    console.log("Making API request to Groq..."); // Debug log

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768", // Updated to correct model name
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API response error:", errorText);

      let errorMessage = "Failed to generate report";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch (e) {
        errorMessage = errorText;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {}
};

const addHeader = (doc: jsPDF, text: string, y: number, fontSize: number = 16) => {
  doc.setFontSize(fontSize);
  doc.setTextColor(...COLORS.primary);
  doc.text(text, doc.internal.pageSize.width / 2, y, { align: "center" });
  
  // Add underline
  const textWidth = doc.getTextWidth(text);
  const startX = (doc.internal.pageSize.width - textWidth) / 2;
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(startX, y + 1, startX + textWidth, y + 1);
  
  return y + 10;
};

const addSection = (doc: jsPDF, title: string, content: string, startY: number) => {
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.primary);
  doc.text(title, MARGINS.left, startY);
  
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  const splitContent = doc.splitTextToSize(content, doc.internal.pageSize.width - MARGINS.left - MARGINS.right);
  doc.text(splitContent, MARGINS.left, startY + 7);
  
  return startY + 7 + (splitContent.length * 5);
};

const addPatientInfoSection = (doc: jsPDF, patientData: ReportData, startY: number) => {
  const pageWidth = doc.internal.pageSize.width;
  
  doc.setFillColor(...COLORS.secondary);
  doc.roundedRect(MARGINS.left, startY, pageWidth - MARGINS.left - MARGINS.right, 45, 3, 3, "F");
  
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.text);
  
  // Left column info
  let infoY = startY + 12;
  doc.setFont(undefined, 'bold');
  doc.text("Patient Name:", MARGINS.left + 5, infoY);
  doc.setFont(undefined, 'normal');
  doc.text(patientData.patientName || "Not Specified", MARGINS.left + 45, infoY);
  
  infoY += 10;
  doc.setFont(undefined, 'bold');
  doc.text("Disease:", MARGINS.left + 5, infoY);
  doc.setFont(undefined, 'normal');
  doc.text(patientData.diseaseName, MARGINS.left + 45, infoY);
  
  infoY += 10;
  doc.setFont(undefined, 'bold');
  doc.text("Primary Symptom:", MARGINS.left + 5, infoY);
  doc.setFont(undefined, 'normal');
  doc.text(patientData.symptom, MARGINS.left + 45, infoY);

  // Right column info
  infoY = startY + 12;
  const rightColumnX = pageWidth - MARGINS.right - 100;
  doc.setFont(undefined, 'bold');
  doc.text("Report Date:", rightColumnX, infoY);
  doc.setFont(undefined, 'normal');
  doc.text(formatDate(new Date().toISOString()), rightColumnX + 40, infoY);
  
  infoY += 10;
  doc.setFont(undefined, 'bold');
  doc.text("Duration:", rightColumnX, infoY);
  doc.setFont(undefined, 'normal');
  doc.text(`${patientData.estimatedDays} days`, rightColumnX + 40, infoY);
  
  infoY += 10;
  doc.setFont(undefined, 'bold');
  doc.text("Average Score:", rightColumnX, infoY);
  doc.setFont(undefined, 'normal');
  doc.text(patientData.averageScore.toFixed(1), rightColumnX + 40, infoY);

  return startY + 55;
};

const addSymptomTrackingTable = (doc: jsPDF, patientData: ReportData, startY: number) => {
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primary);
  doc.text("Symptom Tracking Summary", MARGINS.left, startY);
  
  const sortedLogs = [...patientData.dailyLogs].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate weekly averages
  const weeklyData = sortedLogs.reduce((acc, log, index) => {
    const weekNumber = Math.floor(index / 7);
    if (!acc[weekNumber]) {
      acc[weekNumber] = {
        scores: [],
        severities: new Set()
      };
    }
    acc[weekNumber].scores.push(log.score);
    acc[weekNumber].severities.add(log.severity);
    return acc;
  }, {} as Record<number, { scores: number[], severities: Set<string> }>);

  const tableData = Object.entries(weeklyData).map(([week, data]) => {
    const avgScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
    const severities = Array.from(data.severities).join(", ");
    return [
      `Week ${parseInt(week) + 1}`,
      avgScore.toFixed(1),
      severities,
      data.scores.length.toString()
    ];
  });

  autoTable(doc, {
    startY: startY + 5,
    head: [["Period", "Avg Score", "Severity Levels", "Days Logged"]],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      halign: 'center',
      valign: 'middle',
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: COLORS.headerText,
      fontSize: 11,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: COLORS.secondary,
    },
    margin: { top: 10 },
  });

  return (doc as any).lastAutoTable.finalY + 10;
};

const generatePDF = (reportContent: string, patientData: ReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let currentY = MARGINS.top;

  // Add header
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(...COLORS.headerText);
  doc.setFontSize(24);
  doc.text("Medical Progress Report", pageWidth / 2, 25, { align: "center" });

  // Add sections
  currentY = 50;
  currentY = addPatientInfoSection(doc, patientData, currentY);
  currentY = addSymptomTrackingTable(doc, patientData, currentY);

  // Add report content
  if (reportContent) {
    const sections = reportContent.split('\n\n');
    sections.forEach((section) => {
      if (section.trim()) {
        if (currentY > doc.internal.pageSize.height - 60) {
          doc.addPage();
          currentY = MARGINS.top;
        }
        
        const [title, content] = section.split(':').map(s => s.trim());
        if (title && content) {
          doc.setFontSize(12);
          doc.setTextColor(...COLORS.primary);
          doc.setFont(undefined, 'bold');
          doc.text(title, MARGINS.left, currentY);
          currentY += 7;

          doc.setFontSize(10);
          doc.setTextColor(...COLORS.text);
          doc.setFont(undefined, 'normal');
          const splitContent = doc.splitTextToSize(content, pageWidth - MARGINS.left - MARGINS.right);
          doc.text(splitContent, MARGINS.left, currentY);
          currentY += splitContent.length * 6 + 10;
        }
      }
    });
  }

  // Add footer to each page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.text);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  return doc;
};

export const generateReport = async (data: ReportData): Promise<Blob> => {
  try {
    // Generate prompt and call Groq API
    const prompt = generatePrompt(data);
    const reportContent = await callGroqAPI(prompt);

    // Generate PDF with the report content
    const doc = generatePDF(reportContent, data);

    // Return PDF as blob
    return doc.output("blob");
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
};
