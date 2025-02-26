import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongodb";
import { AiRiskAssessment } from "@/schema/ai-risk-assessment";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { symptoms, predictedDisease, followUpSteps, recoveryDays } = await req.json();

    // Validate required fields
    if (!symptoms || !predictedDisease) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingAssessment = await AiRiskAssessment.findOne({
      patientEmail: session.user.email,
      'diseases.predictedDisease': predictedDisease
    });

    if (existingAssessment) {
      return NextResponse.json(
        { error: "Disease already exists" },
        { status: 400 }
      );
    }

    const assessment = await AiRiskAssessment.findOneAndUpdate(
      { patientEmail: session.user.email },
      {
        $push: {
          diseases: {
            predictedDisease,
            symptoms,
            followUpSteps,
            recoveryDays
          }
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { message: "Assessment saved successfully", assessment },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error saving assessment:", error);
    return NextResponse.json(
      { error: "Failed to save assessment", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectToDatabase();

    const assessments = await AiRiskAssessment.find({ 
      patientEmail: session.user.email 
    }).sort({ createdAt: -1 }).lean();

    return NextResponse.json(assessments, { status: 200 });
    
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessments", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}