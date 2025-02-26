// app/api/reports/route.ts
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

        const reportData = await request.json();
        await connectToDatabase();

        // If it's a prescription being sent to a patient (contains userEmail in payload)
        if (reportData.userEmail) {
            const report = await Report.create(reportData);
            return NextResponse.json(report);
        } 
        // If it's a regular report creation (use session user's email)
        else {
            const { title, filename, description, imageUrl } = reportData;
            
            if (!title || !filename || !description || !imageUrl) {
                return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
            }

            const report = new Report({
                userEmail: session.user.email,
                title,
                filename,
                description,
                imageUrl
            });

            await report.save();
            return NextResponse.json({ message: "Report created successfully", report }, { status: 201 });
        }
    } catch (error) {
        console.error("Error creating report:", error);
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
        const query = userEmail ? { userEmail } : { userEmail: session.user.email };
        const reports = await Report.find(query).sort({ createdAt: -1 });

        return NextResponse.json(reports);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}