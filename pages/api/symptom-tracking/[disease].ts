import { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import SymptomTracking from "@/models/SymptomTracking";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { disease } = req.query;

  try {
    await connectToDatabase();

    // Fetch data from MongoDB
    const data = await SymptomTracking.findOne({
      diseaseName: disease as string,
    }).populate("dailyLogs");

    if (!data) {
      return res.status(404).json({ error: "Data not found" });
    }

    // Calculate required statistics
    interface DailyLog {
      severity: "Low" | "Medium" | "High";
      score: number;
    }

    interface SymptomTrackingData {
      diseaseName: string;
      dailyLogs: DailyLog[];
      toObject: () => Record<string, any>;
    }

    const averageScore: number =
      (data as SymptomTrackingData).dailyLogs.reduce(
        (acc: number, log: DailyLog) => acc + log.score,
        0
      ) / (data as SymptomTrackingData).dailyLogs.length;
    const severities = data.dailyLogs.map(
      (log: { severity: any }) => log.severity
    );

    const reportData = {
      ...data.toObject(),
      averageScore,
      highestSeverity: severities.includes("High")
        ? "High"
        : severities.includes("Medium")
        ? "Medium"
        : "Low",
      lowestSeverity: severities.includes("Low")
        ? "Low"
        : severities.includes("Medium")
        ? "Medium"
        : "High",
    };

    res.status(200).json(reportData);
  } catch (error) {
    console.error("Error fetching report data:", error);
    res.status(500).json({ error: "Failed to fetch report data" });
  }
}
