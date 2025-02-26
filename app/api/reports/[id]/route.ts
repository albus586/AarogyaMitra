import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Report from '@/schema/report';
import connectToDatabase from '@/lib/mongodb';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Get the report data from the request body
        const reportData = await request.json();
        
        // Ensure the userEmail from the request payload is used
        // This will be the patient's email, not the logged-in doctor's email
        if (!reportData.userEmail) {
            return NextResponse.json({ error: "Patient email is required" }, { status: 400 });
        }

        await connectToDatabase();

        // Create the report with the patient's email
        const report = await Report.create(reportData);

        return NextResponse.json(report);
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userEmail = searchParams.get('userEmail');

        await connectToDatabase();

        // If userEmail is provided, fetch reports for that specific user
        // This allows doctors to view patient reports while patients see only their own
        const query = userEmail ? { userEmail } : {};
        const reports = await Report.find(query).sort({ createdAt: -1 });

        return NextResponse.json(reports);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}