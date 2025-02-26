import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Appointment from '@/schema/appointment';
import connectToDatabase from '@/lib/mongodb';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const { appointmentStatus, prescriptionStatus } = await request.json();

    // Validate required fields
    if (!id || (!appointmentStatus && !prescriptionStatus)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update appointment status or prescription status
    const updateData: any = {};
    if (appointmentStatus) updateData.appointmentStatus = appointmentStatus;
    if (prescriptionStatus) updateData.prescriptionStatus = prescriptionStatus;

    const updatedAppointment = await Appointment.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(updatedAppointment, { status: 200 });
  } catch (error: any) {
    console.error('Error in PATCH /api/appointments/[id]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: "Missing appointment ID" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const appointment = await Appointment.findOneAndDelete({
            _id: id,
            patientEmail: session.user.email // Ensure the appointment belongs to the user
        });

        if (!appointment) {
            return NextResponse.json(
                { error: "Appointment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: "Appointment deleted successfully" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error deleting appointment:", error);
        return NextResponse.json(
            { error: "Failed to delete appointment", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: "Missing appointment ID" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const appointment = await Appointment.findById(id);

        if (!appointment) {
            return NextResponse.json(
                { error: "Appointment not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(appointment, { status: 200 });

    } catch (error) {
        console.error("Error fetching appointment:", error);
        return NextResponse.json(
            { error: "Failed to fetch appointment", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}