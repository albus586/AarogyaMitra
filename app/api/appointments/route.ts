import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Appointment from '@/schema/appointment';
import User from '@/schema/user';
import connectToDatabase from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { doctorId, doctorName, specialization, appointmentDate, timeSlot } = await request.json();

        // Validate required fields
        if (!doctorId || !doctorName || !specialization || !appointmentDate || !timeSlot) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        await connectToDatabase();
        
        // Check if appointment slot is already taken
        const existingAppointment = await Appointment.findOne({
            doctorId,
            appointmentDate: new Date(appointmentDate),
            timeSlot
        });

        if (existingAppointment) {
            return NextResponse.json(
                { error: "This time slot is already booked" },
                { status: 409 }
            );
        }

        const appointment = new Appointment({
            patientEmail: session.user.email,
            doctorId,
            doctorName,
            specialization,
            appointmentDate: new Date(appointmentDate),
            timeSlot
        });

        await appointment.save();

        return NextResponse.json(
            { message: "Appointment booked successfully", appointment },
            { status: 201 }
        );

    } catch (error) {
        console.error("Error booking appointment:", error);
        return NextResponse.json(
            { error: "Failed to book appointment", details: error instanceof Error ? error.message : "Unknown error" },
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
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let appointments;

        if (user.userType === 'Doctor') {
            // Fetch appointments for doctor
            appointments = await Appointment.find({ doctorName: user.name }).lean();

            const detailedAppointments = await Promise.all(
                appointments.map(async (appointment) => {
                    const patient = await User.findOne({ email: appointment.patientEmail }).lean();
                    return {
                        ...appointment,
                        patientName: patient?.name,
                        age: patient?.age,
                        phone: patient?.phoneNo,
                        email: patient?.email,
                        bloodPressure: patient?.bp,
                        weight: patient?.weight,
                        heartRate: patient?.heartRate,
                        previousVisit: patient?.previousVisit,
                        allergies: patient?.allergies,
                        medications: patient?.currentMedication,
                        reason: patient?.reasonForVisit,
                        date: appointment.appointmentDate.toISOString().split('T')[0],
                        time: appointment.timeSlot,
                    };
                })
            );
            
            return NextResponse.json(detailedAppointments, { status: 200 });
        } else {
            // Fetch appointments for patient
            appointments = await Appointment.find({ 
                patientEmail: session.user.email 
            }).sort({ appointmentDate: -1 }).lean();

            const formattedAppointments = appointments.map(appointment => ({
                ...appointment,
                date: appointment.appointmentDate.toISOString().split('T')[0],
                time: appointment.timeSlot
            }));
            
            return NextResponse.json(formattedAppointments, { status: 200 });
        }
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return NextResponse.json(
            { error: "Failed to fetch appointments", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}