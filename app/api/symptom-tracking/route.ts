import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import { SymptomTracking } from "@/schema/symptom-tracking";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { diseaseName, symptom, estimatedDays, score, severity } = await req.json();
    await connectToDatabase();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let tracking = await SymptomTracking.findOne({
      patientEmail: session.user.email,
      diseaseName,
      symptom
    });

    if (!tracking) {
      tracking = new SymptomTracking({
        patientEmail: session.user.email,
        diseaseName,
        symptom,
        estimatedDays,
        dailyLogs: []
      });
    }

    tracking.dailyLogs.push({
      date: today,
      score,
      severity
    });

    await tracking.save();
    return NextResponse.json(tracking, { status: 200 });

  } catch (error) {
    console.error("Error in symptom tracking:", error);
    return NextResponse.json(
      { error: "Failed to save symptom tracking" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectToDatabase();
    
    // Get all patient data (for admin/doctor view)
    const trackings = await SymptomTracking.find({})
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance


    return NextResponse.json(trackings, { status: 200 });
  } catch (error) {
    console.error("Error fetching symptom tracking:", error);
    return NextResponse.json(
      { error: "Failed to fetch symptom tracking" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { diseaseName, symptom, isCured } = await req.json();
    await connectToDatabase();

    const tracking = await SymptomTracking.findOneAndUpdate(
      {
        patientEmail: session.user.email,
        diseaseName,
        symptom
      },
      { $set: { isCured } },
      { new: true }
    );

    return NextResponse.json(tracking, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update symptom status" },
      { status: 500 }
    );
  }
}