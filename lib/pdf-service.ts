import { GoogleGenerativeAI } from "@google/generative-ai";
import { Disease } from "./diseases";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

function sanitizeValue(value: any, type: 'radio' | 'number'): string {
  if (type === 'number') {
    // Handle different number formats
    if (typeof value === 'string') {
      // Remove any non-numeric characters except dots and minus
      const numStr = value.replace(/[^\d.-]/g, '');
      const num = parseFloat(numStr);
      return !isNaN(num) ? num.toString() : '';
    } else if (typeof value === 'number') {
      return value.toString();
    }
    return '';
  }
  // For radio type, return the string value
  return value?.toString() || '';
}

export async function extractValuesFromPDF(file: File, disease: Disease): Promise<Record<string, string>> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fileBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(fileBuffer).toString("base64");

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf"
        }
      },
      `From this medical report, extract only the available values for the following fields. Only include values that are explicitly mentioned in the report:

${disease.questions.map(q => `${q.text}${q.unit ? ` (${q.unit})` : ''}`).join('\n')}

Return only the found values in JSON format with the exact question text as keys. Do not include fields where values are not clearly stated in the report.`
    ]);

    let jsonStr = result.response.text();
    jsonStr = jsonStr.replaceAll("```", "").replaceAll("json", ""); // Fix unquoted keys
    console.log("Extracted data:", jsonStr);
    const extractedData = JSON.parse(jsonStr);

    // Validate extracted values against expected types
    const validatedData: Record<string, string> = {};
    disease.questions.forEach(question => {
      const value = extractedData[question.text] || 
                   extractedData[`${question.text}${question.unit ? ` (${question.unit})` : ''}`];
      
      if (value !== undefined) {
        const sanitizedValue = sanitizeValue(value, question.type);
        if (sanitizedValue) {
          validatedData[question.text] = sanitizedValue;
        }
      }
    });

    return validatedData;
  } catch (error) {
    console.error("PDF extraction failed:", error);
    throw error;
  }
}

function isValidValue(value: any, type: 'radio' | 'number'): boolean {
  if (type === 'number') {
    return !isNaN(Number(value));
  }
  return typeof value === 'string';
}
