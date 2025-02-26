import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDatabase from '@/lib/mongodb';
import Prescription from '@/schema/prescription';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { prescription_duration, patient_name, doctor_name, medicine_table, userEmail, prescriptionId } = await request.json();

    // Validate required fields
    if (!prescription_duration || !patient_name || !doctor_name || !medicine_table || !userEmail || !prescriptionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const medicine_names = medicine_table.map((medicine: { "Medicine Name": string }) => medicine["Medicine Name"]);

    const newPrescription = new Prescription({
      prescription_duration: parseInt(prescription_duration, 10), // Ensure it's an integer
      patient_name,
      doctor_name,
      medicine_names,
      created_at: new Date(),
      userEmail, // Include userEmail field
      prescriptionId, // Include prescriptionId field
    });

    await newPrescription.save();

    return NextResponse.json(
      { message: "Prescription stored successfully", prescription: newPrescription },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error storing prescription:", error);
    return NextResponse.json(
      { error: "Failed to store prescription", details: error instanceof Error ? error.message : "Unknown error" },
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

    const prescriptions = await Prescription.find({ userEmail: session.user.email });

    return NextResponse.json(prescriptions, { status: 200 });

  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch prescriptions" },
      { status: 500 }
    );
  }
}
